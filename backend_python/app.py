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
    voted_at = db.Column(db.DateTime, default=datetime.utcnow)

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

        user = db.session.get(User, profile['id_str'])
        if user:
            # Update user info
            user.username = profile['screen_name']
            user.displayName = profile['name']
            user.photo = profile['profile_image_url_https'].replace('_normal', '')
            user.followersCount = profile['followers_count']
        else:
            # Create new user
            user = User(
                id=profile['id_str'],
                username=profile['screen_name'],
                displayName=profile['name'],
                photo=profile['profile_image_url_https'].replace('_normal', ''),
                followersCount=profile['followers_count']
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
        # We'll search for pairs against a common token like USDC to get a broad list.
        url = "https://api.dexscreener.com/latest/dex/search?q=USDC"
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

# --- Endpoint: Solana Wallet ---
@app.route('/api/wallet/<wallet_address>')
def get_wallet_portfolio(wallet_address):
    try:
        client = Client(SOLANA_RPC_URL)
        wallet_pubkey = Pubkey.from_string(wallet_address)
    except Exception as e:
        return jsonify({"success": False, "error": f"Endereço inválido: {e}"}), 400

    try:
        sol_balance_resp = client.get_balance(wallet_pubkey)
        sol_balance = sol_balance_resp.value / 1e9

        sol_price_info = get_sol_price_info()
        sol_price_usd = sol_price_info['market_data']['current_price']['usd'] if sol_price_info else 0

        portfolio = []
        total_portfolio_value_usd = sol_balance * sol_price_usd

        portfolio.append({
            "mint": "So11111111111111111111111111111111111111112",
            "name": "Solana",
            "symbol": "SOL",
            "amount": sol_balance,
            "priceUsd": sol_price_usd,
            "valueUsd": sol_balance * sol_price_usd,
            "icon": sol_price_info.get('image', {}).get('thumb') if sol_price_info else None
        })

        token_accounts_resp = client.get_token_accounts_by_owner(
            wallet_pubkey,
            TokenAccountOpts(program_id=Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"))
        )
        token_accounts = token_accounts_resp.value

        for account in token_accounts:
            if not hasattr(account.account.data, 'parsed'):
                continue

            parsed_info = account.account.data.parsed['info']
            mint_address = parsed_info['mint']
            token_balance = float(parsed_info.get('tokenAmount', {}).get('uiAmount', 0))

            if token_balance <= 0:
                continue

            token_info = get_coingecko_token_info(mint_address)
            if not token_info:
                continue

            price_usd = token_info.get('market_data', {}).get('current_price', {}).get('usd', 0)
            token_value_usd = token_balance * price_usd
            total_portfolio_value_usd += token_value_usd

            portfolio.append({
                "mint": mint_address,
                "name": token_info.get('name'),
                "symbol": token_info.get('symbol', '').upper(),
                "amount": token_balance,
                "priceUsd": price_usd,
                "valueUsd": token_value_usd,
                "icon": token_info.get('image', {}).get('thumb')
            })

        return jsonify({
            "success": True,
            "data": {
                "wallet": wallet_address,
                "totalValueUsd": total_portfolio_value_usd,
                "solValueUsd": sol_balance * sol_price_usd,
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
    data = request.get_json()
    option = data.get('option')

    vote = Vote.query.filter_by(is_active=True).first()
    if not vote:
        return jsonify({"success": False, "error": "Nenhuma votação ativa"}), 404

    if option not in vote.options:
        return jsonify({"success": False, "error": "Opção inválida"}), 400

    response = VoteResponse(vote_id=vote.id, option=option)
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

    results = {opt: 0 for opt in vote.options}
    for r in VoteResponse.query.filter_by(vote_id=vote.id).all():
        if r.option in results:
            results[r.option] += 1

    return jsonify({
        "success": True,
        "voteId": vote.id,
        "title": vote.title,
        "options": vote.options,
        "results": results
    })

# --- Início da app ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Start the background thread for fetching DexScreener data
    dex_fetcher_thread = threading.Thread(target=update_dex_data_periodically, daemon=True)
    dex_fetcher_thread.start()

    app.run(debug=True, port=3001)
