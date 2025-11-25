from bs4 import BeautifulSoup
import json

def extract_sticker_data(file_path):
    sticker_data = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        soup = BeautifulSoup(html_content, 'html.parser')

        stickers = soup.find_all('div', class_='sticker')

        for sticker in stickers:
            img_tag = sticker.find('img')
            name_div = sticker.find('div', class_='name')

            if img_tag and name_div:
                src = img_tag.get('src')
                name = name_div.text.strip()

                sticker_data.append({'src': src, 'name': name})
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
    except Exception as e:
        print(f"An error occurred: {e}")

    return sticker_data

def save_to_json(data, output_file_path):
    """
    Saves a list of dictionaries to a JSON file.

    Args:
        data (list): The data to save.
        output_file_path (str): The path to the output JSON file.
    """
    try:
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Data successfully saved to {output_file_path}")
    except Exception as e:
        print(f"Error saving to JSON file: {e}")

if __name__ == "__main__":
    # Content from inside gallery div on link below
    # https://stickers.dld.hackclub.app/
    input_file = 'Untitled-2.html'
    output_file = 'stickers.json'

    extracted_data = extract_sticker_data(input_file)

    if extracted_data:
        save_to_json(extracted_data, output_file)
    else:
        print("No sticker data was extracted.")