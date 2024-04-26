import pandas as pd

def get_sp500_data():
    # Get S&P 500 ticker symbols
    try:
        sp500_tickers = pd.read_html('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')[0]['Symbol'].tolist()
    except Exception as e:
        print(f"Error getting ticker symbols: {e}")
        return None  # Return None on error

    # Write ticker symbols to a text file
    try:
        with open('../src/assets/tickers.txt', 'w') as file:
            for ticker in sp500_tickers:
                file.write(f"{ticker}\n")
        print("Ticker symbols written to tickers.txt")
    except Exception as e:
        print(f"Error writing ticker symbols to file: {e}")
        return None  # Return None on error

    return sp500_tickers

if __name__ == '__main__':
    get_sp500_data()