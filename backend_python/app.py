from flask import Flask, jsonify, request, redirect, session, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import requests
from solana.rpc.api import Client
from solders.pubkey import Pubkey
from solana.rpc.types import TokenAccountOpts
import os
from dotenv import load_dotenv
from requests_oauthlib import OAuth1Session
import jwt
import json
from urllib.parse import urlencode
import threading
import time
from werkzeug.security import generate_password_hash, check_password_hash


load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)


# --- Configuração da base de dados ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SESSION_SECRET')
db = SQLAlchemy(app)
DEX_DATA_FILE = os.path.join("instance", "dex_data.json")

# --- Configuração externa ---
SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com"
COINGECKO_API_URL = "https://api.coingecko.com/api/v3"
TWITTER_CONSUMER_KEY = os.getenv('TWITTER_CONSUMER_KEY')
TWITTER_CONSUMER_SECRET = os.getenv('TWITTER_CONSUMER_SECRET')
JWT_SECRET = os.getenv('JWT_SECRET')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
http_session = requests.Session()

# --- Modelos ---
class User(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    displayName = db.Column(db.String(120), nullable=False)
    photo = db.Column(db.String(200))
    followersCount = db.Column(db.Integer)
    email = db.Column(db.String(120), nullable=False)
    passwordHash = db.Column(db.String(128))
    ip = db.Column(db.String(45))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'displayName': self.displayName,
            'photo': self.photo,
            'followersCount': self.followersCount
        }

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    options = db.Column(db.PickleType, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=False)

class VoteResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vote_id = db.Column(db.Integer, db.ForeignKey('vote.id'), nullable=False)
    option = db.Column(db.String(100), nullable=False)
    vote_type = db.Column(db.String(10), nullable=False)  # 'for' or 'against'
    voted_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.String(50), nullable=False)  # Twitter user id

# --- Autenticação com Twitter ---
@app.route('/api/auth/twitter')
def twitter_login():
    callback_uri = url_for('twitter_callback', _external=True)
    oauth = OAuth1Session(TWITTER_CONSUMER_KEY, client_secret=TWITTER_CONSUMER_SECRET, callback_uri=callback_uri)
    
    try:
        fetch_response = oauth.fetch_request_token('https://api.twitter.com/oauth/request_token')
        session['oauth_token'] = fetch_response.get('oauth_token')
        session['oauth_token_secret'] = fetch_response.get('oauth_token_secret')

        authorization_url = oauth.authorization_url('https://api.twitter.com/oauth/authorize')
        return redirect(authorization_url)
    except Exception as e:
        return jsonify({"success": False, "error": f"Error connecting to Twitter: {str(e)}"}), 500

@app.route('/api/auth/twitter/callback')
def twitter_callback():
    oauth = OAuth1Session(
        TWITTER_CONSUMER_KEY,
        client_secret=TWITTER_CONSUMER_SECRET,
        resource_owner_key=session.get('oauth_token'),
        resource_owner_secret=session.get('oauth_token_secret'),
        verifier=request.args.get('oauth_verifier')
    )
    
    try:
        access_token = oauth.fetch_access_token('https://api.twitter.com/oauth/access_token')
        
        # Get user profile
        profile_oauth = OAuth1Session(
            TWITTER_CONSUMER_KEY,
            client_secret=TWITTER_CONSUMER_SECRET,
            resource_owner_key=access_token.get('oauth_token'),
            resource_owner_secret=access_token.get('oauth_token_secret')
        )
        profile_response = profile_oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json')
        profile = profile_response.json()

        user = db.session.query(User).filter_by(email=f"{profile['id_str']}@twitter.local").first()
        if user:
            # Update user info
            user.username = profile['screen_name']
            user.displayName = profile['name']
            user.photo = profile['profile_image_url_https'].replace('_normal', '')
            user.followersCount = profile['followers_count']
            if not user.email:
                user.email = f"{profile['id_str']}@twitter.local"
        else:
            # Create new user
            user = User(
                id=profile['id_str'],
                username=profile['screen_name'],
                displayName=profile['name'],
                photo=profile['profile_image_url_https'].replace('_normal', ''),
                followersCount=profile['followers_count'],
                email=f"{profile['id_str']}@twitter.local",
                passwordHash=None
            )
            db.session.add(user)
        db.session.commit()

        # Create JWT
        payload = {
            'id': user.id,
            'username': user.username,
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

        user_data = user.to_dict()
        user_json = json.dumps(user_data)

        # Redirect to frontend
        params = {
            'token': token,
            'user': user_json
        }
        redirect_url = f"{FRONTEND_URL}/auth/callback?{urlencode(params)}"
        return redirect(redirect_url)

    except Exception as e:
        return jsonify({"success": False, "error": f"Authentication failed: {str(e)}"}), 400

# --- DexScreener Trending ---
def fetch_and_save_dex_data():
    """Fetches trending token data from DexScreener and saves it to a file."""
    try:
        # The public DexScreener API does not have a direct endpoint for "trending".
        # We'll search for a major Solana DEX to get a list of pairs only on that chain.
        url = "https://api.dexscreener.com/latest/dex/search?q=raydium&limit20&sortBy=marketCap&sortOrder=desc"
        response = http_session.get(url)
        response.raise_for_status()
        data = response.json()

        # We will assume the API returns pairs sorted by some relevance/volume metric.
        solana_pairs = [p for p in data.get('pairs', []) if p.get('chainId') == 'solana'][:20]

        # Ensure the instance directory exists
        os.makedirs(os.path.dirname(DEX_DATA_FILE), exist_ok=True)

        with open(DEX_DATA_FILE, 'w') as f:
            json.dump(solana_pairs, f, indent=4)
        print("Successfully fetched and saved DexScreener data.")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching DexScreener data: {e}")
    except Exception as e:
        print(f"An error occurred in fetch_and_save_dex_data: {e}")

def update_dex_data_periodically():
    """Runs the data fetcher in a loop."""
    while True:
        fetch_and_save_dex_data()
        time.sleep(30) # Wait for 30 seconds

@app.route('/api/dex/trending')
def get_dex_trending():
    try:
        with open(DEX_DATA_FILE, 'r') as f:
            data = json.load(f)
        return jsonify({"pairs": data})
    except FileNotFoundError:
        return jsonify({"success": False, "error": "Data not available yet. Please try again in a moment."}), 404
    except Exception as e:
        return jsonify({"success": False, "error": f"An error occurred: {str(e)}"}), 500

# --- Helpers CoinGecko ---
def get_sol_price_info():
    try:
        url = f"{COINGECKO_API_URL}/coins/solana"
        response = http_session.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Erro CoinGecko (SOL): {e}")
        return None

def get_coingecko_token_info(contract_address):
    if not contract_address:
        return None
    try:
        url = f"{COINGECKO_API_URL}/coins/solana/contract/{contract_address}"
        response = http_session.get(url)
        if response.status_code == 429:
            print(f"Rate limited CoinGecko para {contract_address}.")
            return None
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Erro CoinGecko token: {e}")
        return None

# --- Endpoint: Meme coins ---
@app.route('/api/top-meme-coins')
def get_top_meme_coins():
    url = f"{COINGECKO_API_URL}/coins/markets"
    params = {
        'vs_currency': 'usd',
        'category': 'meme-token',
        'order': 'market_cap_desc',
        'per_page': 20,
        'page': 1,
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        meme_coins = []
        for coin in data:
            platforms = coin.get('platforms', {})
            network, address = next(iter(platforms.items())) if platforms else (None, None)
            meme_coins.append({
                'name': coin.get('name'),
                'symbol': coin.get('symbol'),
                'price': coin.get('current_price'),
                'marketCap': coin.get('market_cap'),
                'contractAddress': address,
                'network': network,
                'image': coin.get('image'),
            })

        return jsonify({"success": True, "count": len(meme_coins), "data": meme_coins})
    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "error": "Erro CoinGecko"}), 500

# --- Endpoint: Vault Balance ---
@app.route('/api/vault/balance')
def get_vault_balance():
    # Internal vault wallet address - keep this private on backend
    VAULT_WALLET_ADDRESS = "9f2ornZ1JAe3T1gGx7ZdfwrfRioJdAf1W1JPSCDEU6Lz"  # Our portfolio wallet
    
    try:
        client = Client(SOLANA_RPC_URL)
        wallet_pubkey = Pubkey.from_string(VAULT_WALLET_ADDRESS)
    except Exception as e:
        return jsonify({"success": False, "error": f"Invalid wallet address: {e}"}), 400

    try:
        sol_balance_resp = client.get_balance(wallet_pubkey)
        sol_balance = sol_balance_resp.value / 1e9

        sol_price_info = get_sol_price_info()
        sol_price_usd = sol_price_info['market_data']['current_price']['usd'] if sol_price_info else 0
        
        total_vault_value_usd = sol_balance * sol_price_usd

        return jsonify({
            "success": True,
            "data": {
                "balance": sol_balance,
                "totalValueUsd": total_vault_value_usd,
                "solPriceUsd": sol_price_usd
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": "Failed to fetch vault balance"}), 500

# --- Endpoint: Portfolio Holdings ---
@app.route('/api/portfolio')
def get_portfolio():
    # Use the same vault wallet address for portfolio
    VAULT_WALLET_ADDRESS = "9f2ornZ1JAe3T1gGx7ZdfwrfRioJdAf1W1JPSCDEU6Lz"
    return get_wallet_portfolio(VAULT_WALLET_ADDRESS)

# --- Endpoint: Solana Wallet ---
@app.route('/api/wallet/<wallet_address>')
def get_wallet_portfolio(wallet_address):
    try:
        client = Client(SOLANA_RPC_URL)
        wallet_pubkey = Pubkey.from_string(wallet_address)
    except Exception as e:
        return jsonify({"success": False, "error": f"Endereço inválido: {e}"}), 400

    try:
        # Use Helius API for everything
        HELIUS_API_KEY = os.getenv('HELIUS_API_KEY')
        HELIUS_URL = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_API_KEY}" if HELIUS_API_KEY else "https://mainnet.helius-rpc.com/"
        
        # Get SOL balance using Helius
        sol_balance_payload = {
            "jsonrpc": "2.0",
            "id": "get-balance",
            "method": "getBalance",
            "params": [wallet_address]
        }
        
        sol_balance_resp = requests.post(HELIUS_URL, headers={"Content-Type": "application/json"}, json=sol_balance_payload)
        sol_balance_resp.raise_for_status()
        sol_balance_data = sol_balance_resp.json()
        
        sol_balance = 0
        if 'result' in sol_balance_data and 'value' in sol_balance_data['result']:
            sol_balance = sol_balance_data['result']['value'] / 1e9

        portfolio = []
        total_portfolio_value_usd = 0

        # Add SOL to portfolio with price lookup
        sol_price_usd = 0
        if sol_balance > 0:
            # Get SOL price from Jupiter
            try:
                jupiter_url = "https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112"
                jupiter_resp = requests.get(jupiter_url, timeout=3)
                if jupiter_resp.status_code == 200:
                    jupiter_data = jupiter_resp.json()
                    if 'data' in jupiter_data and 'So11111111111111111111111111111111111111112' in jupiter_data['data']:
                        sol_price_usd = jupiter_data['data']['So11111111111111111111111111111111111111112']['price']
            except Exception as e:
                pass
            
            sol_value_usd = sol_balance * sol_price_usd
            total_portfolio_value_usd += sol_value_usd
            
            portfolio.append({
                "mint": "So11111111111111111111111111111111111111112",
                "name": "Solana",
                "symbol": "SOL",
                "amount": sol_balance,
                "priceUsd": sol_price_usd,
                "valueUsd": sol_value_usd,
                "icon": "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
            })

        # Get token accounts using Helius getTokenAccountsByOwner
        token_accounts_payload = {
            "jsonrpc": "2.0",
            "id": "get-token-accounts",
            "method": "getTokenAccountsByOwner",
            "params": [
                wallet_address,
                {
                    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                },
                {
                    "encoding": "jsonParsed"
                }
            ]
        }

        token_accounts_resp = requests.post(HELIUS_URL, headers={"Content-Type": "application/json"}, json=token_accounts_payload)
        token_accounts_resp.raise_for_status()
        token_accounts_data = token_accounts_resp.json()

        if 'result' not in token_accounts_data:
            return jsonify({
                "success": True,
                "data": {
                    "wallet": wallet_address,
                    "totalValueUsd": total_portfolio_value_usd,
                    "solValueUsd": 0,
                    "tokens": portfolio
                }
            })

        token_accounts = token_accounts_data['result']['value']

        for account in token_accounts:
            try:
                # Extract token info from Helius token account response
                account_info = account.get('account', {})
                data = account_info.get('data', {})
                parsed = data.get('parsed', {})
                info = parsed.get('info', {})
                
                mint_address = info.get('mint')
                token_amount_info = info.get('tokenAmount', {})
                token_balance = float(token_amount_info.get('uiAmount', 0))
                decimals = token_amount_info.get('decimals', 0)

                if token_balance <= 0:
                    continue

                # Get token metadata using Helius DAS API
                token_name = f"Token {mint_address[:8]}..." if mint_address else "Unknown Token"
                token_symbol = f"TOKEN-{mint_address[:8]}" if mint_address else "UNKNOWN"
                token_image = None
                price_usd = 0
                
                # Try to get metadata from Helius DAS API
                try:
                    metadata_payload = {
                        "jsonrpc": "2.0",
                        "id": "get-asset-metadata",
                        "method": "getAsset",
                        "params": {
                            "id": mint_address
                        }
                    }
                    
                    metadata_resp = requests.post(HELIUS_URL, headers={"Content-Type": "application/json"}, json=metadata_payload)
                    if metadata_resp.status_code == 200:
                        metadata_data = metadata_resp.json()
                        if 'result' in metadata_data:
                            result = metadata_data['result']
                            content = result.get('content', {})
                            metadata = content.get('metadata', {})
                            
                            if metadata.get('name'):
                                token_name = metadata['name']
                            if metadata.get('symbol'):
                                token_symbol = metadata['symbol'].upper()
                            
                            # Get image from links
                            links = content.get('links', {})
                            if links.get('image'):
                                token_image = links['image']
                except Exception as metadata_error:
                    pass
                
                # Try to get price from Jupiter first
                try:
                    jupiter_url = f"https://price.jup.ag/v4/price?ids={mint_address}"
                    jupiter_resp = requests.get(jupiter_url, timeout=3)
                    if jupiter_resp.status_code == 200:
                        jupiter_data = jupiter_resp.json()
                        if 'data' in jupiter_data and mint_address in jupiter_data['data']:
                            price_usd = jupiter_data['data'][mint_address]['price']
                except Exception:
                    pass
                
                # If Jupiter fails, try DEXScreener
                if price_usd == 0:
                    try:
                        dex_url = f"https://api.dexscreener.com/latest/dex/tokens/{mint_address}"
                        dex_resp = requests.get(dex_url, timeout=3)
                        if dex_resp.status_code == 200:
                            dex_data = dex_resp.json()
                            if 'pairs' in dex_data and len(dex_data['pairs']) > 0:
                                # Get the pair with highest liquidity
                                best_pair = max(dex_data['pairs'], key=lambda x: float(x.get('liquidity', {}).get('usd', 0)))
                                price_usd = float(best_pair.get('priceUsd', 0))
                    except Exception:
                        pass

                token_value_usd = token_balance * price_usd
                total_portfolio_value_usd += token_value_usd

                portfolio.append({
                    "mint": mint_address,
                    "name": token_name,
                    "symbol": token_symbol,
                    "amount": token_balance,
                    "priceUsd": price_usd,
                    "valueUsd": token_value_usd,
                    "icon": token_image
                })

            except Exception:
                continue

        # Sort tokens by USD value (highest first)
        portfolio.sort(key=lambda x: x['valueUsd'], reverse=True)

        return jsonify({
            "success": True,
            "data": {
                "wallet": wallet_address,
                "totalValueUsd": total_portfolio_value_usd,
                "solValueUsd": sol_balance * sol_price_usd if 'sol_price_usd' in locals() else 0,
                "tokens": portfolio
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": "Erro interno"}), 500

# --- Votação: Criar nova (ativa) ---
@app.route('/api/createvote', methods=['POST'])
def create_vote():
    data = request.get_json()
    title = data.get('title')
    options = data.get('options')

    if not title or not isinstance(options, list) or len(options) < 2:
        return jsonify({"success": False, "error": "Título ou opções inválidas"}), 400

    # Desativa as anteriores
    Vote.query.update({Vote.is_active: False})

    new_vote = Vote(title=title, options=options, is_active=True)
    db.session.add(new_vote)
    db.session.commit()

    return jsonify({"success": True, "voteId": new_vote.id})

# --- Votação: Votar na ativa ---
@app.route('/api/vote', methods=['POST'])
def vote_active():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({"success": False, "error": "Authentication required"}), 401
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('id')
        if not user_id:
            raise Exception('Invalid token')
    except Exception as e:
        return jsonify({"success": False, "error": "Invalid or expired token"}), 401

    data = request.get_json()
    option = data.get('option')
    vote_type = data.get('vote_type')  # 'for' or 'against'

    if vote_type not in ['for', 'against']:
        return jsonify({"success": False, "error": "Tipo de voto inválido"}), 400

    vote = Vote.query.filter_by(is_active=True).first()
    if not vote:
        return jsonify({"success": False, "error": "Nenhuma votação ativa"}), 404

    if option not in vote.options:
        return jsonify({"success": False, "error": "Opção inválida"}), 400

    # Check if user already voted for this specific option/proposal
    already_voted = VoteResponse.query.filter_by(vote_id=vote.id, user_id=user_id, option=option).first()
    if already_voted:
        return jsonify({"success": False, "error": "Você já votou nesta proposta."}), 400

    response = VoteResponse(vote_id=vote.id, option=option, vote_type=vote_type, user_id=user_id)
    db.session.add(response)
    db.session.commit()

    return jsonify({"success": True, "message": "Voto registado", "voteId": vote.id})

# --- Votação: Adicionar opções à ativa ---
@app.route('/api/vote/add-option', methods=['POST'])
def add_option_to_active_vote():
    data = request.get_json()
    new_options = data.get('options')

    if not isinstance(new_options, list) or not all(isinstance(opt, str) for opt in new_options):
        return jsonify({"success": False, "error": "Deve fornecer lista de strings"}), 400

    vote = Vote.query.filter_by(is_active=True).first()
    if not vote:
        return jsonify({"success": False, "error": "Nenhuma votação ativa"}), 404

    original_len = len(vote.options)
    vote.options = list(set(vote.options + new_options))

    if len(vote.options) == original_len:
        return jsonify({"success": False, "message": "Nenhuma nova opção adicionada"}), 200

    db.session.commit()
    return jsonify({"success": True, "message": "Opções adicionadas", "options": vote.options})

# --- Votação: Consultar resultados da ativa ---
@app.route('/api/vote/active', methods=['GET'])
def get_active_vote():
    vote = Vote.query.filter_by(is_active=True).first()
    if not vote:
        return jsonify({"success": False, "error": "Nenhuma votação ativa"}), 404

    results = {}
    for opt in vote.options:
        results[opt] = {"for": 0, "against": 0}
    
    for r in VoteResponse.query.filter_by(vote_id=vote.id).all():
        if r.option in results:
            if r.vote_type == 'for':
                results[r.option]["for"] += 1
            elif r.vote_type == 'against':
                results[r.option]["against"] += 1

    return jsonify({
        "success": True,
        "voteId": vote.id,
        "title": vote.title,
        "options": vote.options,
        "results": results
    })

# --- Votação: Consultar detalhes dos resultados da ativa ---
@app.route('/api/vote/active/details', methods=['GET'])
def get_active_vote_details():
    vote = Vote.query.filter_by(is_active=True).first()
    if not vote:
        return jsonify({"success": False, "error": "Nenhuma votação ativa"}), 404

    mint_addresses = vote.options
    if not isinstance(mint_addresses, list) or not all(isinstance(m, str) for m in mint_addresses):
        return jsonify({"success": False, "error": "Opções inválidas (devem ser endereços de token Solana)"}), 400

    HELIUS_API_KEY = os.getenv('HELIUS_API_KEY')
    HELIUS_URL = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_API_KEY}" if HELIUS_API_KEY else "https://mainnet.helius-rpc.com/"

    details = []
    for mint in mint_addresses:
        asset_info = {}
        try:
            payload = {
                "jsonrpc": "2.0",
                "id": "get-token-metadata",
                "method": "getAsset",
                "params": {
                    "id": mint
                }
            }
            resp = requests.post(HELIUS_URL, headers={"Content-Type": "application/json"}, json=payload)
            resp.raise_for_status()
            result = resp.json().get('result', {})
            # Extrair campos relevantes
            asset_info = {
                'mint': mint,
                'name': result.get('content', {}).get('metadata', {}).get('name'),
                'symbol': result.get('content', {}).get('metadata', {}).get('symbol'),
                'image': result.get('content', {}).get('links', {}).get('image'),
                'json_uri': result.get('content', {}).get('json_uri'),
                'metadata': result.get('content', {}).get('metadata', {}),
                'raw': result
            }
        except Exception as e:
            asset_info = {
                'mint': mint,
                'name': None,
                'symbol': None,
                'image': None,
                'json_uri': None,
                'metadata': {},
                'raw': {},
                'error': str(e)
            }
        details.append(asset_info)
        time.sleep(0.05)  # evitar rate limit

    return jsonify({
        "success": True,
        "voteId": vote.id,
        "title": vote.title,
        "options": mint_addresses,
        "details": details
    })


# --- Email/Password Registration ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"success": False, "error": "Email and password required"}), 400
    # Limitar a 5 contas por IP
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    ip_count = User.query.filter_by(ip=ip).count() if hasattr(User, 'ip') else 0
    if hasattr(User, 'ip') and ip_count >= 5:
        return jsonify({"success": False, "error": "You can't create more than 5 accounts"}), 429
    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": "Email already registered"}), 400
    password_hash = generate_password_hash(password)
    user = User(
        id=f"email-{email}",
        username=email.split('@')[0],
        displayName=email.split('@')[0],
        email=email,
        passwordHash=password_hash,
        ip=ip if hasattr(User, 'ip') else None
    )
    db.session.add(user)
    db.session.commit()
    payload = {
        'id': user.id,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    return jsonify({"success": True, "token": token, "user": user.to_dict()})

# --- Email/Password Login ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"success": False, "error": "Email and password required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.passwordHash or not check_password_hash(user.passwordHash, password):
        return jsonify({"success": False, "error": "Invalid email or password"}), 400
    payload = {
        'id': user.id,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    return jsonify({"success": True, "token": token, "user": user.to_dict()})

# --- Início da app ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Start the background thread for fetching DexScreener data
    dex_fetcher_thread = threading.Thread(target=update_dex_data_periodically, daemon=True)
    dex_fetcher_thread.start()

    app.run(debug=True, port=3001)
