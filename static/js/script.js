let loaded = false;
let currentBoard = null;
let lastPlacements = [];
let fifteenLetterWords = '';

// Get random 15-letter words
fetch('https://6e66f2kddafrk76hpborn2amse0pitds.lambda-url.us-west-2.on.aws/', {
  method: 'GET'
})
  .then(response => response.json())
  .then(data => {
    fifteenLetterWords = data;
  })

// Banner tile positions
const now_loading_banner = [
  ["N", [1, 2]],
  ["O", [1, 3]],
  ["W", [1, 4]],
  ["L", [1, 6]],
  ["O", [1, 7]],
  ["A", [1, 8]],
  ["D", [1, 9]],
  ["I", [1, 10]],
  ["N", [1, 11]],
  ["G", [1, 12]]
]

const detection_error_banner = [
  ["D", [5, 3]],
  ["E", [5, 4]],
  ["T", [5, 5]],
  ["E", [5, 6]],
  ["C", [5, 7]],
  ["T", [5, 8]],
  ["I", [5, 9]],
  ["O", [5, 10]],
  ["N", [5, 11]],
  ["E", [7, 5]],
  ["R", [7, 6]],
  ["R", [7, 7]],
  ["O", [7, 8]],
  ["R", [7, 9]],
  ["O", [10, 6]],
  ["r", [10, 7]],
  ["z", [10, 8]],
]

const welcome_banner = [
  ["W", [2, 4]],
  ["E", [2, 5]],
  ["L", [2, 6]],
  ["C", [2, 7]],
  ["O", [2, 8]],
  ["M", [2, 9]],
  ["E", [2, 10]],
  ["P", [6, 1]],
  ["L", [6, 2]],
  ["E", [6, 3]],
  ["A", [6, 4]],
  ["S", [6, 5]],
  ["E", [6, 6]],
  ["U", [6, 8]],
  ["P", [6, 9]],
  ["L", [6, 10]],
  ["O", [6, 11]],
  ["A", [6, 12]],
  ["D", [6, 13]],
  ["A", [8, 3]],
  ["P", [8, 5]],
  ["I", [8, 6]],
  ["C", [8, 7]],
  ["T", [8, 8]],
  ["U", [8, 9]],
  ["R", [8, 10]],
  ["E", [8, 11]],
  ["T", [10, 3]],
  ["O", [10, 4]],
  ["D", [10, 6]],
  ["E", [10, 7]],
  ["T", [10, 8]],
  ["E", [10, 9]],
  ["C", [10, 10]],
  ["T", [10, 11]],
  ["T", [12, 3]],
  ["H", [12, 4]],
  ["E", [12, 5]],
  ["B", [12, 7]],
  ["O", [12, 8]],
  ["A", [12, 9]],
  ["R", [12, 10]],
  ["D", [12, 11]]
]
class ScrabbleBoard {

  /**
   * Initialise scrabble board
   */
  constructor() {
    this.board = document.getElementById("js-board");
  }

  /**
   * Draw scrabble board
   */
  draw() {
    var sb = this;
    var boardSize = 14;
    var tileScore = {}
    var tileScoreIdx = {
      'ct': [112], 'tw': [0, 7, 105],
      'tl': [20, 76, 80], 'dw': [16, 32, 48, 64],
      'dl': [3, 36, 45, 52, 92, 96, 108]
    };
    if (sb.board !== null) {
      var tabletop = $(sb.board);
      var board = $('<div>').addClass('board');
      // define a quarter of the board and use for x and y axis mirroring
      for (var i = 0; i <= boardSize; i++) {
        var row = $('<div>').addClass('row');
        for (var j = 0; j <= boardSize; j++) {
          var tile = $('<div>').addClass('tile')
            .attr({ 'data-row': i, 'data-col': j })
            .append($('<div contenteditable="true">').addClass('decal'))
            .append($('<input>').attr({ maxlength: 1, readonly: 1 }));
          var ti = this.toTileIndex(i, j);
          for (var t in tileScoreIdx) {
            var idx = tileScoreIdx[t].indexOf(ti);
            if (idx >= 0) {
              tile.addClass('tile-' + t);
              if (i !== boardSize / 2 || j !== boardSize / 2) {
                tile.children('.decal').text(t.toUpperCase());
              }
              if (j <= boardSize) {
                // flip col
                var tiHMir = this.toTileIndex(i, boardSize - j);
                tileScoreIdx[t].push(tiHMir);
              }
              if (i <= boardSize) {
                // flip row
                var tiVMir = this.toTileIndex(boardSize - i, j);
                tileScoreIdx[t].push(tiVMir);
              }
              //tileScoreIdx[t].splice(idx, 1);
              break;
            }
          }
          row.append(tile);
        }
        board.append(row);
      }
      tabletop.append(board);
      // listener for tile keydown event
      tabletop.on('keydown', '.tile input', function (event) {
        var elem = $(this);
        var ltr = event.key;
        var keyCode = event.keyCode;
        // only update on alphabet char
        if (keyCode >= 65 && keyCode <= 90) {
          elem.val(ltr);
          elem.addClass('filled');
        }
        // clear on backspace or delete
        else if (keyCode == 8 || keyCode == 46) {
          elem.removeClass('filled');
          elem.removeClass('filledNew');
          elem.parent(".tile").removeAttr("data-value");
        }
        // allow change
        return true;
      });
    } else {
      console.log('board not defined');
    }
  }

  /**
   * Converts row and column to single index.
   * @param {int} row
   * @param {int} column
   * @returns {int} -1 if row or column is out of range
   */
  toTileIndex(row, column) {
    var boardLen = 15;
    if (row < boardLen && row >= 0 && column < boardLen && column >= 0) {
      return row * boardLen + column;
    } else {
      return -1;
    }
  };

  /**
   * Get the letter score value
   */
  letterValue(letter) {
    var tileScore = {
      0: '?', 1: 'a,e,i,l,n,o,r,s,t,u', 2: 'd,g',
      3: 'b,c,m,p', 4: 'f,h,v,w,y', 5: 'k', 8: 'j,x', 10: 'q,z'
    };
    if (letter.length === 1) {
      for (var v in tileScore) {
        if (tileScore[v].indexOf(letter.toLowerCase()) >= 0) {
          return v;
        }
      }
    }
    return null;
  }
}

var board = new ScrabbleBoard();
board.draw();
writeBanner(welcome_banner, 30);

document.getElementById("fileInput").onchange = function () {
  const file = document.getElementById('fileInput').files[0];

  var invalidWords = document.getElementById("invalidWords");
  invalidWords.style.display = "none";
  var rack = document.getElementById("rack");
  rack.style.display = "none";
  var score = document.getElementById("score");
  score.style.display = "none";

  if (!file) return;
  // Check if the file is an image
  const validImageTypes = ['image/jpeg', 'image/png', 'image/bmp'];
  if (!validImageTypes.includes(file.type)) {
    alert('Please upload a valid image file (JPEG, PNG, BMP).');
    return;
  }
  loaded = false;

  cleanUp(15);
  show15s();
  writeNowLoading();

  if (file) {
    const reader = new FileReader();

    reader.onloadend = async function () {
      // Create an Image element to load the file data
      const img = new Image();
      img.src = reader.result;

      img.onload = async function () {
        // Desired width and height
        const targetWidth = 1080;
        const targetHeight = 1620;

        // Scale the width to 720px and adjust height proportionally
        let width = targetWidth;
        let height = Math.floor(img.height * (targetWidth / img.width));

        // Create a canvas for the resized image
        const canvas = document.createElement('canvas');

        // If the height exceeds 1080px, crop evenly from top and bottom
        if (height > targetHeight) {
          const cropY = (height - targetHeight) / 2; // Amount to crop from the top and bottom
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          // Draw the image cropped evenly from the top and bottom
          ctx.drawImage(img, 0, -cropY, width, height);
        } else {
          // If the height is less than or equal to 1080px, just draw the resized image
          canvas.width = targetWidth;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Convert the resized/cropped image to a base64 string
        const base64String = canvas.toDataURL('image/jpeg').split(',')[1]; // Get the base64 string without the metadata

        const data = {
          image: base64String,
          filename: file.name
        };

        // Send the base64 encoded resized image to AWS Lambda
        try {
          const response = await fetch('https://yg4kghuoxknke5mw6df7z47c5i0qtnct.lambda-url.us-west-2.on.aws/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });

          const result = await response.json();
          console.log('Image upload success:', result);
          loaded = true;
          const bestBoard = result.best_board;
          if (!bestBoard) {
            cleanUp(15);
            writeBanner(detection_error_banner, 0);
            return;
          }
          currentBoard = bestBoard;
          
          rack.style.display = "block";
          let rows = document.getElementsByClassName("row");
          for (let x = 0; x < 15; x++) {
            let row = rows[x].childNodes;
            for (let y = 0; y < 15; y++) {
              let tile = bestBoard[x][y];
              let input = row[y].childNodes[1];
              input.value = '';
              input.classList.remove('filled')
              input.classList.remove('filledNew')
              if (tile.match(/[a-zA-Z]/i)) {
                input.value = tile;
                input.classList.add('filled');
              } else {
                bestBoard[x][y] = " ";
              }
            }
          }
          console.log(result.invalid_words);
          if (!(result.invalid_words == undefined || result.invalid_words == null || result.invalid_words.length == 0)) {
            invalidWords.style.display = "block";
            document.getElementById("text").innerHTML = "Invalid words detected: " + result.invalid_words;
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      };
    };

    reader.readAsDataURL(file); // Read the file as base64
  } else {
    alert('Please select an image file.');
  }
};


async function writeNowLoading() {
  cleanUp(3);
  for (const q of now_loading_banner) {
    if (loaded) {
      break;
    }
    letter = q[0];
    c = q[1]
    let input = document.getElementsByClassName("row")[c[0]].childNodes[c[1]].childNodes[1];
    input.value = letter;
    input.classList.add('filled');
    await sleep(200);
  }
  await sleep(2000);
  if (loaded) return;
  writeNowLoading();
}

async function show15s() {
  let startIndex = Math.floor(Math.random() * 20) * 15;
  sampledWords = fifteenLetterWords.slice(startIndex, startIndex + 90);
  for (let i = 0; i < 90; i++) {
    if (loaded) {
      break;
    }
    letter = sampledWords[i];
    row = Math.floor(i / 15) * 2 + 4;
    col = Math.floor((i % 15));
    let input = document.getElementsByClassName("row")[row].childNodes[col].childNodes[1];
    input.value = letter;
    input.classList.add('filled');
    await sleep(200);
  }
}

function cleanUp(rownum) {
  let rows = document.getElementsByClassName("row");
  for (let x = 0; x < rownum; x++) {
    let row = rows[x].childNodes;
    for (let y = 0; y < 15; y++) {
      let input = row[y].childNodes[1];
      input.value = '';
      input.classList.remove('filled');
      input.classList.remove('filledNew');
    }
  }
}

async function writeBanner(list, delay) {
  for (const q of list) {
    //```console.log(q);
    letter = q[0];
    c = q[1]
    let input = document.getElementsByClassName("row")[c[0]].childNodes[c[1]].childNodes[1];
    input.value = letter;
    input.classList.add('filled');
    if (delay != 0) {
      await sleep(delay);
    }
  }
}

function getRandom15s(random15s) {
  return random15s
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Send the board and rack to Scrabble bot to find the highest scoring play
document.getElementById('lambdaForm').addEventListener('submit', function (event) {
  event.preventDefault();

  let inputString = document.getElementById('inputString').value;
  inputString = inputString.replace(/\?/g, "_");
  inputString = inputString.replace(/\./g, "_");
  // Generate a 15x15 array of random letters
  let stringArray = [];

  let rows = document.getElementsByClassName("row");
  for (let x = 0; x < 15; x++) {
    let row = rows[x].childNodes;
    for (let y = 0; y < 15; y++) {
      currentBoard[x][y] = " ";
      let input = row[y].childNodes[1];
      if (!input.classList.contains('filledNew')) {
        if (input.value.match(/[a-zA-Z]/i)) currentBoard[x][y] = input.value;
      }
    }
  }


  if (currentBoard) {
    stringArray = currentBoard;
  } else {
    stringArray = generateRandomArray(15, 15);
  }
  // Data to send to the Lambda function
  const data = {
    stringArray: stringArray,
    inputString: inputString
  };

  // Send the data using Fetch API
  fetch('https://c5dnukepegytmvh6odkxice3ve0twxow.lambda-url.us-west-2.on.aws/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)  // Convert the JavaScript object to JSON
  })
    .then(response => response.json())
    .then(result => {
      console.log(result);

      let rows = document.getElementsByClassName("row");
      if (lastPlacements != null || lastPlacements.length != 0) {
        for (p of lastPlacements) {
          if (p.existing == false) {
            let row = rows[p.row].childNodes;
            let input = row[p.col].childNodes[1];
            input.classList.remove('filledNew');
            input.value = '';
          }
        }
      }
      for (p of result.placements) {
        if (p.existing == false) {
          let row = rows[p.row].childNodes;
          let input = row[p.col].childNodes[1];
          let tile = p.tile;
          input.value = '';
          input.classList.remove('filled');
          input.classList.remove('filledNew');
          if (tile.match(/[a-zA-Z]/i)) {
            input.value = tile;
            input.classList.add('filledNew');
          }
        }
      }
      lastPlacements = result.placements;

      // Display the result in the HTML page
      var score = document.getElementById("score");
      score.style.display = "block";
      document.getElementById('score').textContent = "Score: " + JSON.stringify(result.score, null, 2);
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

// Function to generate a 15x15 array of random letters
function generateRandomArray(rows, cols) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ                            ';
  const array = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      row.push(randomLetter);
    }
    array.push(row);
  }
  return array;
}
