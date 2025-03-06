# Typing Test Program

This is a web-based typing training program that helps users improve their typing speed and accuracy.

- Support uploading custom text files for typing practice
- Real-time display of typing speed (WPM) and accuracy
- Support pause and restart functions
- Real-time display of typing errors
- Beautiful user interface and dynamic background effects
- Display test results and encouraging messages after completion
- Space visualization function
- Support punctuation and special characters
- Responsive design, adaptable to various devices

## Technology Stack

- Front-end: HTML5, CSS3, JavaScript
- Back-end: Python Flask
- UI framework: Bootstrap 5
- Animation: Animate.css
- Icon: Font Awesome
- Prompt box: SweetAlert2

## Installation Instructions

1. Make sure Python 3.6 or higher is installed
2. Clone or download this project to your local computer
3. Install dependent packages:
   ```bash
   pip install -r requirements.txt
   ```

## How to use

1. Run the program：
   ```bash
   python app.py
   ```

2. Open in browser：
   ```
   http://localhost:5000
   ```

3. Click the "Select File" button to upload a text file (supports .txt format)
4. Click the "Upload Text File" button to load the text
5. Click the "Start" button to start the typing test
6. You can use the "Pause" and "Restart" buttons to control the test process at any time
7. Click the "Toggle Background" button to turn on/off the dynamic background effect

## Feature

- **Real-time feedback**: Correct and incorrect inputs are immediately displayed in different colors
- **Space visualization**: Clearly display space characters to avoid input errors
- **Dynamic background**: Optional particle animation effects for a better visual experience
- **Performance evaluation**: Display detailed statistics and encouraging messages after completing the test
- **Progress tracking**: Display typing progress and remaining text in real time

## Sample text

The project includes a `sample.txt` file that you can use for testing. You can also create your own text files to practice.

## Precautions

- The uploaded text file must be in .txt format
- It is recommended to use UTF-8 encoded text files
