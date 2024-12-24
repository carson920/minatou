Minatou is a Scrabble AI solver where users can find the best play by uploading a picture of a Scrabble board.

![Minatou Demo (2)](https://github.com/user-attachments/assets/be9788d2-670f-4143-8bb0-6d3c9aa8dbab)

How to use:
1. Take a picture or upload an existing picture of a Scrabble board.
2. AI guesses the letter tiles on board. Letter for blank tiles are also predicted.
3. Add, remove or edit letter tiles if necessary.
4. Input player's tiles to find the best play and score.

This is the repo for the frontend only.

There is a separate Python repo for analyzing the board image and return the board position, and a Java repo for finding best play for a particular board position and player's rack.
They are both deployed as AWS Lambda and an API endpoint is available to call by the frontend.

