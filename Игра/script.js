//import generateProblem from "./generateProblemModule.js"

class Score {
    constructor() {
        this.points = 0;
        this.setPoints(0);
    }

    setPoints(points) {
        let pointsSpanElement = document.getElementById("current-points-span");
        this.points = points;
        pointsSpanElement.textContent = this.points;
    }
}

let gameSettings = {
    action: {
        sum: true,
        substraction: true,
        multiplication: false,
        division: false
    },
    numbersLength: {
        sum: [1,1],
        substraction: [1,1],
        multiplication: [,],
        division: [,],
    },
    includeNegativeAnswers: false,
    includeNegativeNumbers: false,
}

let submitAnswerButtonElement = document.getElementById("submit-answer-button");
let inputElement = document.getElementById("input");
let startGameButton = document.getElementById("start-game-button");
let startMenuContainerElement = document.getElementById("start-menu-container");
let gameContainerElement = document.getElementById("game-container");
let optionsMenuContainerElement = document.getElementById("options-menu-container");
let mapContainerElement = document.getElementById("map-container");
let continueGameButtonElement = document.getElementById("continue-game-button");
let optionButtonElements = Array.from(document.querySelectorAll("input[type='button']"))
    .filter(x => x.getAttribute("class").includes("options-button"));
let numbersLengthInputElements = Array.from(document.querySelectorAll("#options-menu-container input[type='text']")).filter(x => x.getAttribute("id") != "map-width-height-input");
let numbersLengthOptionsDivElements = Array.from(document.querySelectorAll("div")).filter(x => x.id.includes("options-numbers-length-div"));
let includeNegativeAnswersButtonElement = document.getElementById("include-negative-answers-button");
let outputLabelElement = document.getElementById("output-label");
let newGameButtonElement = document.getElementById("new-game-button");
let goMenuButtonElement = document.getElementById("go-menu-button");
let scoreLabelElement = document.getElementById("score-label");
let clearButtonElement = document.getElementById("clear-button");
let mapWidthHeightInputElement = document.getElementById("map-width-height-input");
let mapOptionsOutputElement = document.getElementById("map-options-label");
let easyButtonElement = document.getElementById("easy-button");
let mediumButtonElement = document.getElementById("medium-button");
let hardButtonElement = document.getElementById("hard-button");
let veryHardButtonElement = document.getElementById("very-hard-button");
let secondGradeButtonElement = document.getElementById("second-grade-button");

let score;
let pathBlocksCount = 0;
let solvedProblems = 0;
let mapWidthHeight = 5;

console.log(numbersLengthOptionsDivElements);

let currentProblem = { firstNum: 0, secondNum: 0, actionSign: "+", result: 0 };
let problemLabelElement = document.getElementById("problem-label");

function initialize() {
    submitAnswerButtonElement.addEventListener("click", (e) => {
        e.preventDefault();

        setTimeout(() => { if (!outputLabelElement.textContent.includes("Поздравления")) outputLabelElement.textContent = "" }, 2000);
        if (!inputElement.value || inputElement.value == "-") {
            outputLabelElement.textContent = "Въведи отговор";
            return;
        }
        let inputValue = Number(inputElement.value);
        inputElement.value = "";
        if (inputValue == currentProblem.result) {
            score.setPoints(score.points + currentProblem.points);
            let currentImg = document.getElementById(solvedProblems);
            currentImg.src = "./path-texture.jpg";
            let newImg = document.getElementById(solvedProblems + 1);
            newImg.src = "./path-with-family-texture.png";
            solvedProblems++;
            if (solvedProblems + 1 == pathBlocksCount) {
                inputElement.disabled = "true";
                submitAnswerButtonElement.disabled = "true";

                mapContainerElement.innerHTML = "";
                let img = document.createElement("img");
                img.src = "./theme-park-picture.png";
                img.setAttribute("draggable", "false");
                img.style.width = "100%";
                mapContainerElement.appendChild(img);
                winGame();
                return;
            }

            inputElement.focus();
            outputLabelElement.textContent = "Браво! Правилен отговор.";
            createAndVisualizeProblem();
        } else {
            if (currentProblem.points > 10) {
                currentProblem.points -= 10;
                console.log(currentProblem.points);
                inputElement.focus();
                outputLabelElement.textContent = "Грешен отговор. Опитай пак."
            }
        }
    });

    startGameButton.addEventListener("click", (e) => {
        e.preventDefault();
        visualizeOptionsMenu();
    });

    continueGameButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        collectSettingsInput();
        let availableFieldElements = numbersLengthInputElements.filter(x => !x.parentNode.getAttribute("class").includes("inactive"));

        let inactiveButtonElements = optionButtonElements.filter(x => x.getAttribute("class").includes("inactive"));
        if (inactiveButtonElements.length == 4) {
            let focusCounter = 0;
            let _class = "button-focus";

            function focusAllButtons() {
                if (_class == "button-focus" && focusCounter == 4) {
                    _class = "options-button-inactive";
                    console.log("entered");
                    focusCounter = 0;
                } else if (_class == "options-button-inactive" && focusCounter == 4) {
                    console.log(focusCounter + "entered");
                    return;
                }
                console.log(focusCounter);
                inactiveButtonElements[focusCounter].setAttribute("class", _class);
                focusCounter++;
                setTimeout(focusAllButtons, 250);
            }
            focusAllButtons();
            return;
        }


        let emptyFieldElements = availableFieldElements.filter(x => x.value == "");
        if (!mapWidthHeightInputElement.value) {
            emptyFieldElements.push(mapWidthHeightInputElement);
        }
        if (emptyFieldElements.length != 0) {
            let focusCounter = 0;

            function focusAtAllEmptyFields() {
                if (focusCounter == emptyFieldElements.length) {
                    return;
                }
                emptyFieldElements[focusCounter].focus()
                focusCounter++;
                setTimeout(focusAtAllEmptyFields, 250);
            }

            focusAtAllEmptyFields();

            return;
        }
        createAndDisplayNewGame();
    })

    optionButtonElements.forEach(x => {
        x.addEventListener("click", (e) => {
            e.preventDefault();
            if (gameSettings.action[e.currentTarget.name]) {
                gameSettings.action[e.currentTarget.name] = false;
            } else {
                gameSettings.action[e.currentTarget.name] = true;
            }
            visualizeOptionsMenu();
        })
    })

    includeNegativeAnswersButtonElement.addEventListener("click", (e) => {
        if (gameSettings.includeNegativeAnswers) {
            gameSettings.includeNegativeAnswers = false;
            includeNegativeAnswersButtonElement.setAttribute("class", "options-button-inactive")
        } else {
            gameSettings.includeNegativeAnswers = true;
            includeNegativeAnswersButtonElement.setAttribute("class", "options-button-active");
        }
    })

    newGameButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        createAndDisplayNewGame();
    })

    goMenuButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        goMenu();
    })

    clearButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        inputElement.focus();
        inputElement.value = "";
    })

    easyButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        numbersLengthInputElements.forEach(x => x.value = "");
        gameSettings.action.sum = true;
        gameSettings.action.substraction = true;
        gameSettings.action.multiplication = false;
        gameSettings.action.division = false;
        gameSettings.numbersLength.sum[0] = 1;
        gameSettings.numbersLength.sum[1] = 1;
        gameSettings.numbersLength.substraction[0] = 1;
        gameSettings.numbersLength.substraction[1] = 1;
        mapWidthHeight = 4;
        gameSettings.includeNegativeAnswers = false;
        visualizeOptionsMenu();
    })

    mediumButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        numbersLengthInputElements.forEach(x => x.value = "");
        gameSettings.action.sum = true;
        gameSettings.action.substraction = true;
        gameSettings.action.multiplication = false;
        gameSettings.action.division = false;
        gameSettings.numbersLength.sum[0] = 2;
        gameSettings.numbersLength.sum[1] = 2;
        gameSettings.numbersLength.substraction[0] = 2;
        gameSettings.numbersLength.substraction[1] = 2;
        mapWidthHeight = 5;
        gameSettings.includeNegativeAnswers = false;
        visualizeOptionsMenu();
    })

    hardButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        numbersLengthInputElements.forEach(x => x.value = "");
        gameSettings.action.sum = true;
        gameSettings.action.substraction = true;
        gameSettings.action.multiplication = true;
        gameSettings.action.division = true;
        gameSettings.numbersLength.sum[0] = 4;
        gameSettings.numbersLength.sum[1] = 4;
        gameSettings.numbersLength.substraction[0] = 3;
        gameSettings.numbersLength.substraction[1] = 3;
        gameSettings.numbersLength.multiplication[0] = 2;
        gameSettings.numbersLength.multiplication[1] = 1;
        gameSettings.numbersLength.division[0] = 2;
        gameSettings.numbersLength.division[1] = 1;
        mapWidthHeight = 8;
        gameSettings.includeNegativeAnswers = true;
        visualizeOptionsMenu();
    })

    veryHardButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        numbersLengthInputElements.forEach(x => x.value = "");
        gameSettings.action.sum = true;
        gameSettings.action.substraction = true;
        gameSettings.action.multiplication = true;
        gameSettings.action.division = true;
        gameSettings.numbersLength.sum[0] = 5;
        gameSettings.numbersLength.sum[1] = 5;
        gameSettings.numbersLength.substraction[0] = 5;
        gameSettings.numbersLength.substraction[1] = 5;
        gameSettings.numbersLength.multiplication[0] = 3;
        gameSettings.numbersLength.multiplication[1] = 3;
        gameSettings.numbersLength.division[0] = 3;
        gameSettings.numbersLength.division[1] = 3;
        mapWidthHeight = 9;
        gameSettings.includeNegativeAnswers = true;
        visualizeOptionsMenu();
    })

    secondGradeButtonElement.addEventListener("click", (e) => {
        e.preventDefault();
        numbersLengthInputElements.forEach(x => x.value = "");
        gameSettings.action.sum = true;
        gameSettings.action.substraction = true;
        gameSettings.action.multiplication = true;
        gameSettings.action.division = true;
        gameSettings.numbersLength.sum[0] = 2;
        gameSettings.numbersLength.sum[1] = 2;
        gameSettings.numbersLength.substraction[0] = 2;
        gameSettings.numbersLength.substraction[1] = 2;
        gameSettings.numbersLength.multiplication[0] = 1;
        gameSettings.numbersLength.multiplication[1] = 1;
        gameSettings.numbersLength.division[0] = 1;
        gameSettings.numbersLength.division[1] = 1;
        mapWidthHeight = 7;
        gameSettings.includeNegativeAnswers = false;
        visualizeOptionsMenu();
    })
}

function goMenu() {
    collectSettingsInput();
    optionsMenuContainerElement.style.display = "none";
    mapContainerElement.style.display = "none";
    gameContainerElement.style.display = "none";
    startMenuContainerElement.style.display = "inline";
    scoreLabelElement.style.display = "none";
    outputLabelElement.style.display = "none";
    problemLabelElement.style.display = "none";
}

function createAndDisplayNewGame() {
    resetGameValues();
    inputElement.value = "";
    inputElement.style.display = "inline";
    inputElement.focus();
    submitAnswerButtonElement.style.display = "inline";
    clearButtonElement.style.display = "inline";
    inputElement.disabled = false;
    submitAnswerButtonElement.disabled = false;
    outputLabelElement.textContent = "";
    solvedProblems = 0;
    optionsMenuContainerElement.style.display = "none";
    gameContainerElement.style.display = "inline";
    generateMap();
    mapContainerElement.style.display = "inline";
    scoreLabelElement.style.display = "inline";
    outputLabelElement.style.display = "inline";
    problemLabelElement.style.display = "inline";
    createAndVisualizeProblem();
}

function collectSettingsInput() {
    mapWidthHeight = mapWidthHeightInputElement.value;
    numbersLengthInputElements.forEach((x, i) => {
        Object.entries(gameSettings.numbersLength).find(y => y[0] == x.parentNode.getAttribute("name"))[1][i % 2] = Number(x.value);
        console.log(gameSettings.numbersLength);
    })
}

function visualizeOptionsMenu() {
    startMenuContainerElement.style.display = "none";
    optionsMenuContainerElement.style.display = "inline";
    optionButtonElements.forEach(x => x.setAttribute("class", gameSettings.action[x.name] == true
        ? "options-button-active" : "options-button-inactive"));
    numbersLengthOptionsDivElements.forEach(x => x.setAttribute("class", gameSettings.action[x.getAttribute("name")] == true
        ? "options-numbers-length-div-active" : "options-numbers-length-div-inactive"));
    includeNegativeAnswersButtonElement.setAttribute("class", gameSettings.includeNegativeAnswers == true ? "options-button-active" : "options-button-inactive");
    numbersLengthInputElements.forEach((x, i) => {
        if (!x.value) {
            x.value = gameSettings.numbersLength[x.parentNode.getAttribute("name")][i % 2] || ""
        }
    });

    mapWidthHeightInputElement.value = mapWidthHeight;
}
function createAndVisualizeProblem() {
    generateProblem(gameSettings, currentProblem);
    problemLabelElement.textContent = `${currentProblem.firstNum} ${currentProblem.actionSign} ${currentProblem.secondNum} = ?`
}

function generateProblem(gameSettings, currentProblem) {
    currentProblem.points = 100;
    //let countOfActiveActions = Object.entries(gameSettings.action).filter(x => x[1] == true).length;
    //let proportionMultiplicator = 4 / countOfActiveActions;
    let currentAction;

    while (true) {
        let randomActionNumber = 10 * Math.random();
        if ((gameSettings.action.sum && randomActionNumber < 2.5)) {
            currentAction = "sum";
        } else if ((gameSettings.action.substraction && randomActionNumber < 5)) {
            currentAction = "substraction";
        } else if ((gameSettings.action.multiplication && randomActionNumber < 7.5)) {
            currentAction = "multiplication";
        } else if (gameSettings.action.division && randomActionNumber < 10) {
            currentAction = "division";
        }

        if (currentAction) {
            break;
        }
    }

    let firstNumMaxLength = gameSettings.numbersLength[currentAction][0];
    let secondNumMaxLength = gameSettings.numbersLength[currentAction][1];

    let firstNumLength = defineNumberLength(firstNumMaxLength);
    let secondNumLength = defineNumberLength(secondNumMaxLength);

    function defineNumberLength(maxLength) {
        while (true) {
            let randomNum = Math.floor(10 * Math.random())
            if (randomNum > maxLength || randomNum == 0) {
                continue;
            }

            return randomNum;
        }
    }

    while (true) {
        currentProblem.firstNum = Math.floor(Math.pow(10, firstNumLength) * Math.random());
        currentProblem.secondNum = Math.floor(Math.pow(10, secondNumLength) * Math.random());



        if ((currentAction == "sum")) {
            currentProblem.actionSign = "+";
            currentProblem.result = currentProblem.firstNum + currentProblem.secondNum;
        } else if ((currentAction == "substraction")) {
            if (gameSettings.includeNegativeAnswers == false && currentProblem.secondNum > currentProblem.firstNum) {
                //let secondNumCopy = currentProblem.secondNum;
                //currentProblem.secondNum = currentProblem.firstNum;
                //currentProblem.firstNum = secondNumCopy;
                continue;
            }
            currentProblem.actionSign = "-";
            currentProblem.result = currentProblem.firstNum - currentProblem.secondNum;
        } else if ((currentAction == "multiplication")) {
            currentProblem.actionSign = ".";
            currentProblem.result = currentProblem.firstNum * currentProblem.secondNum;
        } else {
            if (currentProblem.firstNum == 0) {
                continue;
            }
            if (!Number.isInteger(currentProblem.firstNum / currentProblem.secondNum)) {
                continue;
            }
            currentProblem.actionSign = ":";
            currentProblem.result = currentProblem.firstNum / currentProblem.secondNum;
        }

        break;
    }
    console.log("Result: " + currentProblem.result);
}

function generateMap() {
    let pathCoordinates = generatePathCoordinates(mapWidthHeight);
    let themeParkCoordinates = pathCoordinates[pathCoordinates.length - 1];
    let pathCounter = 0;

    for (let i = 0; i < mapWidthHeight; i++) {
        let parentDivElement = document.createElement("div");
        parentDivElement.setAttribute("class", "map-row")
        for (let j = 0; j < mapWidthHeight; j++) {
            let spanElement = document.createElement("span");
            //spanElement.textContent = "test";
            spanElement.setAttribute("class", "map-cell")
            let imgElement = document.createElement("img");
            let widthHeightPercentageOfCell = 100 / mapWidthHeight;
            imgElement.style.width = `${widthHeightPercentageOfCell}%`;
            imgElement.style.height = `${widthHeightPercentageOfCell}%`;
            imgElement.setAttribute("draggable", "false");

            let src = "./grass-texture1.png";
            if (pathCoordinates.find(x => x[0] == i && x[1] == j)) {
                imgElement.setAttribute("id", pathCounter);
                pathCounter++;
                src = "./path-texture.jpg";
                if (i == 0 && j == 1) {
                    src = "./path-with-family-texture.png";
                } else if (i == themeParkCoordinates[0] && j == themeParkCoordinates[1]) {
                    src = "./theme-park-texture.png";
                }
            }
            imgElement.src = src;
            spanElement.appendChild(imgElement);
            parentDivElement.appendChild(spanElement);
        }

        if (i != 0) {
            parentDivElement.style.top = `-${10 + (i * 4)}px`;
        }
        mapContainerElement.appendChild(parentDivElement);
    }

    pathBlocksCount = pathCounter;
}

function generatePathCoordinates(widthHeight) {
    while (true) {
        let pathCoordinates = [];
        let initialCoordinates = [0, 1];
        pathCoordinates.push(initialCoordinates);
        let breakCycle = false;
        let enteredRight = false;
        let enteredDown = false;

        //while (true) {
        while (true) {
            let direction = "";
            let randomNum = Math.random();
            let newCoordinates = [];
            let lastCoordinates = pathCoordinates[pathCoordinates.length - 1];

            if (randomNum < 0.5) {
                enteredRight = true;
                direction = "right";
                newCoordinates[0] = lastCoordinates[0];
                newCoordinates[1] = lastCoordinates[1] + 1;
                if (newCoordinates[1] == widthHeight - 1) {
                    breakCycle = true;
                }
            } else if (randomNum < 1) {
                enteredDown = true;
                direction = "down";
                newCoordinates[1] = lastCoordinates[1];
                newCoordinates[0] = lastCoordinates[0] + 1;
                if (newCoordinates[0] == widthHeight - 1) {
                    breakCycle = true;
                }
            } else if (randomNum < 0.75) {
                direction = "left";
                newCoordinates[0] = lastCoordinates[0];
                newCoordinates[1] = lastCoordinates[1] - 1;
                if (newCoordinates[1] == 0) {
                    breakCycle = true;
                }
            } else {
                direction = "top";
                newCoordinates[1] = lastCoordinates[1];
                newCoordinates[0] = lastCoordinates[0] - 1;
                if (newCoordinates[0] == 0) {
                    breakCycle = true;
                }
            }

            pathCoordinates.push(newCoordinates);
            if (breakCycle == true) {
                break;
            }

            //if ((pathCoordinates.find(x => x[0] == newCoordinates[0] && Math.abs(x[1] - newCoordinates[1]) == 0)
            //    && (direction == "up" || direction == "down"))
            //    || (pathCoordinates.find(x => x[0] == newCoordinates[0]))) {
            //    continue;
            //}
        }
        //}
        if (enteredDown == true && enteredRight == true) {
            return pathCoordinates;
        }
    }
}

function winGame() {
    let audio = document.getElementById("clapping-sound");
    audio.play();
    scoreLabelElement.style.display = "none";
    problemLabelElement.style.display = "none";
    submitAnswerButtonElement.style.display = "none";
    inputElement.style.display = "none";
    clearButtonElement.style.display = "none";
    outputLabelElement.textContent = "Поздравления! Стигнахте до увеселителния парк! Вашите точки са: " + score.points;
}

function resetGameValues() {
    score = new Score();
    mapContainerElement.innerHTML = "";
}

function checkOptionsInput(event, field) {
    if (event.currentTarget.getAttribute("id") == "map-width-height-input" && !isNaN(event.key)) {
        mapWidthHeight = Number(event.key);
        if (Number(event.key) < 4) {
            mapWidthHeight = 4;
            field.value = 4;
            mapOptionsOutputElement.textContent = "Минималната дължина на картата е 4";
            setTimeout(() => mapOptionsOutputElement.innerHTML = "&nbsp", 1000);
            return false;
        }
    }

    if ((isNaN(event.key) || event.key == "0") && event.keyCode != 8) {
        return false;
    }

    field.value = "";
    return true;
}

function checkInputKey(event, fieldValue) {
    event.preventDefault();

    outputLabelElement.textContent = "";
    let inputFieldElement = event.currentTarget;
    let key = event.key;
    let keyCode = event.keyCode;
    if (keyCode == 8) {
        inputFieldElement.value = fieldValue.substring(0, fieldValue.length - 1);
        return;
    }

    if (!isNaN(key) || key == "-") {
        if (key == "0" && fieldValue[fieldValue.length - 1] == "-") {
            return false;
        }

        if (fieldValue[0] == "0") {
            return false;
        }

        if (key == "-" && fieldValue.length != 0) {
            return false;
        }

        event.currentTarget.value += key;
        return true;
    }

    return false;
}



initialize();