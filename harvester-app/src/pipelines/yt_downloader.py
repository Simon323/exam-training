import os

import cv2
from yt_dlp import YoutubeDL


def create_folder(folder_path):
    """Creates a folder if it does not exist."""
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)


def to_snake_case(name):
    """Convert a string to snake_case."""
    return "_".join("".join(c if c.isalnum() else " " for c in name).split()).lower()


def download_video(url, output_folder="downloads", filename=None):
    """
    Download a video from a given URL.

    Parameters:
    - url: str - The URL of the video to download.
    - output_folder: str - The folder where the video will be saved.
    - filename: str (optional) - The desired name for the output file (without extension).

    Returns:
    - str: The path to the downloaded video.
    """
    create_folder(output_folder)  # Ensure the folder for downloaded videos exists

    # If no filename is provided, use the title from the video
    if filename is None:
        ydl_opts = {"quiet": True}
        with YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=False)
            filename = info_dict.get("title", "downloaded_video")

    # Convert filename to snake_case and set the full download path
    sanitized_filename = to_snake_case(filename)
    download_path = os.path.join(output_folder, f"{sanitized_filename}.mp4")

    # Configure download options
    ydl_opts = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "outtmpl": download_path,
        "merge_output_format": "mp4",
    }

    # Download the video
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    print(f"Video downloaded to {download_path}")
    return download_path


# Function to extract frames at a specified interval
def extract_frames(video_path, output_folder="frames", interval=60):
    # Extract the base name of the video file and convert to snake_case for folder name
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    video_folder = to_snake_case(video_name)

    # Create a subfolder for the video's frames
    video_output_folder = os.path.join(output_folder, video_folder)
    create_folder(video_output_folder)

    # Open the video file
    cap = cv2.VideoCapture(video_path)

    # Get video parameters
    fps = cap.get(cv2.CAP_PROP_FPS)  # frames per second
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))  # total number of frames
    duration = total_frames / fps  # video duration in seconds

    # Extract frames at the specified interval
    for sec in range(0, int(duration), interval):
        # Set frame position
        cap.set(cv2.CAP_PROP_POS_FRAMES, sec * fps)

        # Capture frame
        ret, frame = cap.read()

        if ret:
            # Save frame to file in the subfolder
            frame_filename = os.path.join(video_output_folder, f"frame_{sec}s.png")
            cv2.imwrite(frame_filename, frame)
            print(f"Frame at {sec} seconds saved as {frame_filename}")
        else:
            print(f"Failed to extract frame at {sec} seconds")

    cap.release()

    return video_output_folder


# Example usage
if __name__ == "__main__":
    video_url = "VIDEO_URL"  # Change to your video URL

    # Download video
    video_path = download_video(video_url, output_folder="downloads")

    # Extract frames every 60 seconds
    extract_frames(video_path, output_folder="frames", interval=60)
