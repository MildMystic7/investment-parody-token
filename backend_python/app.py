from flask import Flask, jsonify
from flask_cors import CORS
import requests
from solana.rpc.api import Client
from solders.pubkey import Pubkey
from solana.rpc.types import TokenAccountOpts

app = Flask(__name__)
CORS(app) # This will allow the frontend to call the API

# --- Configuration ---
# Using a public RPC endpoint. For production, you'd use a private/paid one.
SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com"
COINGECKO_API_URL = "https://api.coingecko.com/api/v3"
# Using a session for connection pooling is more efficient
http_session = requests.Session()

# --- Helper Functions ---
def get_sol_price_info():
    """Fetches SOL price and metadata from CoinGecko."""
    try:
        url = f"{COINGECKO_API_URL}/coins/solana"
        response = http_session.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Could not fetch SOL price data from CoinGecko: {e}")
        return None

def get_coingecko_token_info(contract_address):
    """Fetches token information from CoinGecko, handles errors gracefully."""
    if not contract_address:
        return None
    try:
        url = f"{COINGECKO_API_URL}/coins/solana/contract/{contract_address}"
        response = http_session.get(url)
        if response.status_code == 429:
            print(f"Rate limited by CoinGecko for {contract_address}. Skipping.")
            return None
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Could not fetch CoinGecko data for {contract_address}: {e}")
        return None

# --- API Endpoints ---
@app.route('/')
def hello_world():
    return 'Hello from the Python backend!'

@app.route('/api/top-meme-coins')
def get_top_meme_coins():
    """
    Fetches the top 20 meme coins from the CoinGecko API.
    """
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        'vs_currency': 'usd',
        'category': 'meme-token',
        'order': 'market_cap_desc',
        'per_page': 20,
        'page': 1,
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raises an exception for 4XX/5XX errors
        data = response.json()

        # Format the data to match the structure your frontend might expect
        meme_coins = []
        for coin in data:
            platforms = coin.get('platforms', {})
            # Get the first available platform and address
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
        print(f"Error fetching from CoinGecko: {e}")
        return jsonify({"success": False, "error": "Failed to fetch data from CoinGecko"}), 500

@app.route('/api/wallet/<wallet_address>')
def get_wallet_portfolio(wallet_address):
    """
    Fetches the SOL and SPL token balances for a given Solana wallet address,
    along with their USD values.
    """
    try:
        client = Client(SOLANA_RPC_URL)
        wallet_pubkey = Pubkey.from_string(wallet_address)
    except Exception as e:
        return jsonify({"success": False, "error": f"Invalid wallet address: {e}"}), 400

    try:
        # 1. Get SOL balance and price
        sol_balance_resp = client.get_balance(wallet_pubkey)
        sol_balance = sol_balance_resp.value / 1e9  # Convert lamports to SOL

        sol_price_info = get_sol_price_info()
        sol_price_usd = sol_price_info['market_data']['current_price']['usd'] if sol_price_info else 0

        # 2. Prepare portfolio list and total value
        portfolio = []
        total_portfolio_value_usd = sol_balance * sol_price_usd

        # Add SOL to the portfolio
        portfolio.append({
            "mint": "So11111111111111111111111111111111111111112",
            "name": "Solana",
            "symbol": "SOL",
            "amount": sol_balance,
            "priceUsd": sol_price_usd,
            "valueUsd": sol_balance * sol_price_usd,
            "icon": sol_price_info.get('image', {}).get('thumb') if sol_price_info else None
        })

        # 3. Get SPL Token balances
        token_accounts_resp = client.get_token_accounts_by_owner(
            wallet_pubkey,
            TokenAccountOpts(program_id=Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"))
        )
        token_accounts = token_accounts_resp.value

        # 4. Get info for each token and add to portfolio
        for account in token_accounts:
            # Safely skip accounts that do not have parsed data
            if not hasattr(account.account.data, 'parsed'):
                continue
            
            parsed_info = account.account.data.parsed['info']
            mint_address = parsed_info['mint']
            token_balance = float(parsed_info.get('tokenAmount', {}).get('uiAmount', 0))

            if token_balance <= 0:
                continue

            token_info = get_coingecko_token_info(mint_address)
            if not token_info:
                continue # Skip tokens CoinGecko doesn't know about or rate limited ones

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

        # 5. Return final structured response
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
        print(f"An error occurred fetching portfolio for {wallet_address}: {e}")
        return jsonify({"success": False, "error": "An internal error occurred."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001) 