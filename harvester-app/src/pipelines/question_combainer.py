import json
import os


def merge_json_files(input_directory, output_directory="questions/dist"):
    # Check if the input directory exists
    if not os.path.isdir(input_directory):
        print("The provided path is not a directory.")
        return

    # Get the list of JSON files in the directory
    json_files = [f for f in os.listdir(input_directory) if f.lower().endswith(".json")]

    if not json_files:
        print("No JSON files in the directory.")
        return

    # Create the output directory if it does not exist
    os.makedirs(output_directory, exist_ok=True)

    merged_data = []

    # Iterate through JSON files and load their content
    for json_file in json_files:
        file_path = os.path.join(input_directory, json_file)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                merged_data.append(data)
        except Exception as e:
            print(f"Error processing file {json_file}: {e}")

    # Save the merged array to a file
    output_file_path = os.path.join(output_directory, "full_questions.json")
    try:
        with open(output_file_path, "w", encoding="utf-8") as f:
            json.dump(merged_data, f, ensure_ascii=False, indent=4)
        print(f"Merged JSON file saved at: {output_file_path}")
    except Exception as e:
        print(f"Error saving file: {e}")
