import json
import os
import re
import uuid

import pytesseract
from PIL import Image


def extract_text_from_images(directory_path, output_directory="questions"):
    # Check if the directory exists
    if not os.path.isdir(directory_path):
        print("The provided path is not a directory.")
        return

    # Get the list of image files in the directory
    image_files = [
        f
        for f in os.listdir(directory_path)
        if f.lower().endswith((".png", ".jpg", ".jpeg", ".bmp"))
    ]

    if not image_files:
        print("No image files in the directory.")
        return

    # Create directories for results if they do not exist
    verified_dir = os.path.join(output_directory, "verified")
    issued_dir = os.path.join(output_directory, "issued")
    os.makedirs(verified_dir, exist_ok=True)
    os.makedirs(issued_dir, exist_ok=True)

    # Iterate through the image files
    for image_file in image_files:
        image_path = os.path.join(directory_path, image_file).replace("\\", "/")
        try:
            # Load the image
            image = Image.open(image_path)

            # Extract text from the image
            text = pytesseract.image_to_string(image)

            # Split the text into lines
            lines = text.strip().split("\n")
            question_lines = []
            answers = []
            current_answer = None

            # Flag indicating whether we have started processing answers
            in_answers_section = False

            for line in lines:
                line = line.strip()

                # Check if the line starts with an answer letter (e.g., "A.", "B.", etc.)
                match = re.match(r"^[A-D]\.", line)

                if match:
                    # If it's a new answer, save the previous answer
                    if current_answer:
                        answers.append(current_answer)
                    # Start a new answer
                    current_answer = line
                    in_answers_section = True
                elif in_answers_section:
                    # Add lines to the current answer if we have started the answers section
                    current_answer += " " + line
                else:
                    # Add lines to the question if we are still in the question section
                    question_lines.append(line)

            # Add the last answer to the list
            if current_answer:
                answers.append(current_answer)

            # Combine the question into a single text string
            question = " ".join(question_lines)

            # Check if the question starts with a number
            question_id = None
            question_match = re.match(r"^(\d+)[ \.]", question)
            if question_match:
                question_id = int(question_match.group(1))

            # Process the answers
            processed_answers = []
            for idx, answer in enumerate(answers):
                answer_id = chr(97 + idx)  # "a", "b", "c", "d", etc.
                processed_answers.append(
                    {"id": answer_id, "answer": answer, "isCorrect": False}
                )

            # Result object
            result = {
                "questionId": question_id,
                "question": question,
                "answers": processed_answers,
                "source": image_path,
            }

            # Determine the save directory
            output_dir = verified_dir if question_id else issued_dir

            # Generate the file name
            file_name = f"{question_id}.json" if question_id else f"{uuid.uuid4()}.json"
            file_path = os.path.join(output_dir, file_name)

            # Save the result to a JSON file
            with open(file_path, "w", encoding="utf-8") as json_file:
                json.dump(result, json_file, ensure_ascii=False, indent=4)

            print(f"Result saved in file: {file_path}")

        except Exception as e:
            print(f"Error processing file {image_file}: {e}")


# Example usage
# extract_text_from_images("path/to/directory", "path/to/questions")
