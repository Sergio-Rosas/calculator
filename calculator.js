// TODO Refactor the code (just things I know). Divide the pricipal function between event and monitoring.
// TODO Comment what the functions do.
// TODO Explain variables.
// TODO Document the code (important things like description of the functions or messy code only.
// TODO Put on GitHub, deploy and test on desktop and mobile.

// ===================================
//       Variables and listeners
// ===================================
let calculator = document.getElementById("calculator"); // Calculator variable.
let screen = document.getElementById("screen"); // Screen variable.

// Listeners.
calculator.addEventListener("click", whichKey);
document.addEventListener("keydown", keyMapping);

calculator.addEventListener("mouseover", keySelected);
calculator.addEventListener("mouseout", keySelected);
document.addEventListener("keydown", keySelected);
document.addEventListener("keyup", keySelected);

document.addEventListener("keydown", blinkingEffectOn);
document.addEventListener("keyup", blinkingEffectOff);

calculator.addEventListener("click", removeTutorial);
document.addEventListener("keydown", removeTutorial);

document.getElementById("shortcuts").addEventListener("click", (e) => {
    if (e.target.className.includes("close-x")) {
        e.currentTarget.classList.add("animation-removal")
    }
});
setTimeout(turnOnTutorial, 100);

// Category lists.
let actions = ["ce", "on"];
let numbers = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "zero"];
let modifiers = ["sign", "dot"];
let operators = ["equal", "plus", "minus", "times", "division", "root", "percentage"];
let memory = ["mc", "m-plus", "m-minus"];

let validKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", "+", "-", "*", "/", "r", "p", "s", "Enter", "Escape", "Backspace", "F2", "F9", "F10"];

// Status variables.
let calcStatus = false;
let counter;
let num1 = "";
let num2 = "";
let operator;
let decimal = false;
let savedValue = 0;
let mcSwitch = -1;
let tutorial = true;

// Conversion objects.
let strToId = {
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "zero": "0",
};

let keyObject = {
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine",
    "0": "zero",
    ".": "dot",
    "+": "plus",
    "-": "minus",
    "*": "times",
    "/": "division",
    "r": "root",
    "p": "percentage",
    "s": "sign",
    "Enter": "equal",
    "Escape": "on",
    "Backspace": "ce",
    "F2": "mc",
    "F9": "m-plus",
    "F10": "m-minus",
};

let operatorsEquivalent = {
    "plus": "+",
    "minus": "-",
    "times": "x",
    "division": "÷"
};


// ===================================
//               Logic
// ===================================

// Function that handle inputs. Master function.
function whichKey(e) {
    let idValue = typeof e !== "string" ? e.target.id : e;
    if (idValue === "calculator" || idValue === "screen") return;
    // Initialize the calculator.
    if (!calcStatus && idValue === "on") {
        calcStatus = true;
    }
    if (!calcStatus) return;
    // Starts the counter to turn off the calculator after not using it for 5 minutes.
    onOffCounter();

    switch (true) {
        case actions.includes(idValue):
            mcSwitch = -1;
            decimal = false; // Restart the decimal variable to allow a new decimal on the next number.
            actionsFunc(idValue);
            break;
        case numbers.includes(idValue):
            mcSwitch = -1;
            if (num2 && (operator === "equal" || operator === "root")) initializer();
            numbersFunc(idValue);
            break;
        case modifiers.includes(idValue):
            mcSwitch = -1;
            modifiersFunc(idValue);
            break;
        case operators.includes(idValue):
            mcSwitch = -1;
            decimal = false; // Restart the decimal variable to allow a new decimal on the next number.
            if (!num1 && !num2) return;

            if (((num1 && !num2) || (!num1 && num2)) && idValue === "root") {
                calculation(Number(num1), Number(num2), idValue, idValue);
            } else if (num1 && !num2) {
                operation(idValue, num1);
            } else if (!num1 && num2) {
                operation(idValue, num2);
            } else if (num1 && num2 && idValue === "percentage") {
                calculation(Number(num1), Number(num2), idValue, idValue);
            } else {
                calculation(Number(num1), Number(num2), operator, idValue);
            }
            break;
        case memory.includes(idValue):
            decimal = false; // Restart the decimal variable to allow a new decimal on the next number.
            savingFunc(idValue);
            break;
    }

    if (isNaN(num1) || isNaN((num2)) || Number(num2) === Infinity || Number(num2) === -Infinity || Number(num1) === Infinity || Number(num1) === -Infinity) {
        toScreen(false);
        initializer();
    } else {
        toScreen();
        upperOperation(operator);
    }
}

// Reset num and operator variables to start processing from scratch. It triggers every time the "ON" button is pressed.
function initializer() {
    num1 = "";
    num2 = "";
    operator = undefined;
}

// Clears or resets the status of the calculator.
function actionsFunc(id) {
    if (id === "on") {
        initializer();
    } else if (id === "ce") {
        num1 = "";
    }
}

function numbersFunc(strNumber) {
    num1 += strToId[strNumber];
}

function operation(id, number) {
    if (operator) return operator = id;

    num2 = number;
    num1 = "";
    operator = id;
}

function onOffCounter() {
    clearTimeout(counter);
    counter = setTimeout( () => {calcStatus = false; screen.textContent = ""}, 300_000);
}

function modifiersFunc(type) {
    switch (type) {
        case "sign":
            num1 ? num1 *= -1 : num2 ? num2 *= -1 : num1;
            break;
        case "dot":
            if (!decimal) {num1 || num1 === 0 ? num1 += "." : num2 += "."; decimal = true;}
    }
}

function savingFunc(value) {
    switch (value) {
        case "m-plus":
            if (num1) {
                savedValue += Number(num1);
            } else {
                savedValue += Number(num2);
            }
            initializer();
            break;
        case "m-minus":
            if (num1) {
                savedValue -= Number(num1);
            } else {
                savedValue -= Number(num2);
            }
            initializer();
            break;
        case "mc":
            mcSwitch *= -1;
            if (mcSwitch < 0) {savedValue = ""; initializer();}
            if (!num1) {
                num1 = savedValue;
            } else {
                num2 = savedValue;
            }
            break;
    }
}

function calculation(number1, number2, operation, newOperator) {
    let answer = 0;
    switch (operation) {
        case "plus":
            answer = number2 + number1;
            break;
        case "minus":
            answer = number2 - number1;
            break;
        case "times":
            answer = number2 * number1;
            break;
        case "division":
            answer = number2 / number1;
            break;
        case "root":
            if (number1) {
                answer = Math.sqrt(number1);
            } else {
                answer = Math.sqrt(number2);
            }
            break;
        case "percentage":
            answer = number2 * (number1 / 100);
            break;
    }
    if (answer === 0) return initializer();
    num1 = "";
    num2 = answer;
    operator = newOperator;
}

// Key mapping function.
function keyMapping(e) {
    if (validKeys.includes(e.key)) {
        e.preventDefault();
        if (!e.repeat) whichKey(keyObject[e.key]);
    }
}


// ------------ Graphics ------------
function toScreen(valid=true) {
    if (!valid) {
        screen.textContent = "Error";
    } else if (!num2) {
        screen.textContent = fitScreen(num1);
    } else if (operator && !num1) {
        screen.textContent = fitScreen(num2);
    } else if (num1 && num2) {
        screen.textContent = fitScreen(num1);
    } else {
        screen.textContent = 0;
    }
}

function fitScreen(value) {
    if (value === "") return 0;
    if (String(value).length <= 10) return value;

    let sciNotation;

    // If the last two characters absolute value are less than 7 return the first 10 characters of the number. Otherwise returns the number on scientific notation.
    if (Math.abs(Number(Number(value).toExponential().slice(-2))) >= 7) {
        sciNotation = Number(value).toExponential(3);
    } else {
        sciNotation = Number(String(value).slice(0, 10));
    }

    return sciNotation;
}

// Putting opacity on keys when hover or pressing a key
function keySelected(e) {
    e.type === "keydown" || e.type === "keyup" ? opacityKey(e) : opacityHover(e);
}

function opacityKey(e) {
    if (validKeys.includes(e.key)) {
        let calcKey = document.getElementById(keyObject[e.key]);
        let bColor = getComputedStyle(calcKey).backgroundColor;

        if (e.type === "keydown"){
            calcKey.style.backgroundColor = `${bColor.slice(0, -4)}0.7)`;
        } else {
            calcKey.style.backgroundColor = `${bColor.slice(0, -4)}0.9)`;
        }
    }
}

function opacityHover(e) {
    if (e.target.id !== "calculator" && e.target.id !== "screen") {
        let bColor = getComputedStyle(e.target).backgroundColor;

        if (e.type === "mouseover") {
            e.target.style.backgroundColor = `${bColor.slice(0, -4)}0.7)`;
        } else {
            e.target.style.backgroundColor = `${bColor.slice(0, -4)}0.9)`;
        }
    }
}

function blinkingEffectOn(e) {
    if (validKeys.includes(e.key)) {
        screen.style.animationName = "blinking";
        screen.style.animationDuration = "1s";
    }
}

function blinkingEffectOff() {
    screen.style.animationName = "";
}

function upperOperation(operator) {
    screen.style.position = "relative";

    operDisplay = document.createElement("span");
    operDisplay.classList.add("upper-operation");
    operDisplay.textContent = operatorsEquivalent[operator];

    screen.append(operDisplay);
}
// Tutorial graphics.
function turnOnTutorial() {
    if (!tutorial) return;
    let onButton = document.getElementById("on");

    let divContainer = document.createElement("div");
    divContainer.id = "container";

    let floatingMessage = document.createElement("div");
    floatingMessage.classList.add("floating-box", "animation-add");
    floatingMessage.id = "turn-on-message";
    floatingMessage.textContent = "Click the 'ON' button or press the 'Esc' key to start the calculator";

    let tail = document.createElement("div");
    tail.classList.add("tail-style");

    floatingMessage.append(tail);
    divContainer.append(floatingMessage);
    onButton.append(divContainer);

    floatingMessage.style.top = `-${floatingMessage.offsetHeight + tail.offsetHeight + 5}px`;
    floatingMessage.style.left = `-${(floatingMessage.offsetWidth / 2) - (onButton.offsetWidth / 2)}px`;

}

function removeTutorial(e) {
    if (!tutorial) return;
    if (e.key === "Escape" || e.target.id === "on") {
        let message = document.getElementById("container");
        message.classList.add("animation-removal");
        setTimeout( () => message.remove(), 3_000);
        tutorial = false;
    }
}
