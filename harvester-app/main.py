from src.pipelines import (
    download_video,
    extract_frames,
    extract_text_from_images,
    merge_json_files,
)

if __name__ == "__main__":
    video_url = "VIDEO_URL"  # Provide the video URL
    downloads_folder = "downloads"  # Subfolder for downloaded videos
    frames_folder = "frames"  # Subfolder for extracted frames
    frame_interval = 10  # Interval in seconds to extract frames

    # Download the video and save it in the downloads directory
    video_path = download_video(video_url, output_folder=downloads_folder)

    # Extract frames and save them in the frames directory
    frames_folder = extract_frames(
        video_path, output_folder=frames_folder, interval=frame_interval
    )

    # Extract text from images in the frames directory
    extract_text_from_images(frames_folder)

    # Merge JSON files with questions

    merge_json_files("questions/verified")
