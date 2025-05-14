const buttons = document.querySelectorAll(".calculator-buttons__button");
const expressionDisplay = document.querySelector("#expression");
const resultDisplay = document.querySelector("#result");

//######### 함수 정의 ############
/**
 *
 * @param {string} char
 * @returns {boolean}
 */
const isEqualSign = (char) => {
  return char === "=";
};
/**
 *
 * @param {string} char
 * @returns {boolean}
 */
const isClear = (char) => {
  return char === "C";
};
/**
 *
 * @param {string} char
 * @returns {boolean}
 */
const isOperator = (char) => {
  const operators = ["+", "-", "*", "/"];

  return operators.includes(char);
};
/**
 *
 * @param {string} str
 * @returns {boolean}
 */
const isNumber = (str) => {
  return !isNaN(Number(str));
};

/**
 * 숫자 또는 괄호 사이에 곱셈 기호가 생략된 경우 '*'를 삽입한다.
 *
 * @param {string} expression
 * @returns {string}
 */
const insertMultiplyBetweenNumberAndParentheses = (expression) => {
  const result = [];
  const len = expression.length;

  for (let i = 0; i < len; i++) {
    const char = expression[i];
    const prev = i > 0 ? expression[i - 1] : null;
    const next = i + 1 < len ? expression[i + 1] : null;

    // 왼쪽 괄호의 앞이 숫자나 ')'이면 곱셈 삽입
    if (i !== 0 && char === "(" && (isNumber(prev) || prev === ")")) {
      result.push("*");
    }

    result.push(char);

    // 오른쪽 괄호의 뒤가 숫자나 '('이면 곱셈 삽입
    if (i !== len - 1 && char === ")" && (isNumber(next) || next === "(")) {
      result.push("*");
    }
  }

  return result.join("");
};

/**
 *
 * @param {string} expression
 * @returns {boolean}
 */
const isValidParenthesesPair = (expression) => {
  //1. 왼 괄호와 오른쪽 괄호가 짝지어져 있는가? -> 스택 사용

  const stack = [];

  for (let i = 0; i < expression.length; i++) {
    const char = expression.at(i);
    if (char === "(") {
      stack.push(1);
    } else if (char === ")") {
      if (stack.length === 0) {
        return false;
      } else {
        stack.pop();
      }
    }
  }

  return stack.length === 0;
};

/**
 *
 * @param {string} expression
 * @returns {boolean}
 */
const isValidOperatorAndOperandPair = (expression) => {
  //연산자가 있을 때
  //왼쪽은 숫자이거나 ")"이어야함
  //오른쪽은 숫자이거나 "(" 이어야함
  //최소 1개의 operator
  let operatorCount = 0;

  for (let i = 0; i < expression.length; i++) {
    const char = expression.at(i);
    const prev = expression.at(i - 1);
    const next = expression.at(i + 1);

    if (isOperator(char)) {
      if (!(prev === ")" || isNumber(prev))) return false;

      if (!(next === "(" || isNumber(next))) return false;

      operatorCount++;
    }
  }

  return true;
};

/**
 *
 * @param {string} expression
 * @returns {boolean}
 */
const isValidExpression = (expression) => {
  //1.괄호가 맞냐?
  if (!isValidParenthesesPair(expression)) return false;

  //2.피연산자와 연산자가 올바르게 배치되어 있는가?
  if (!isValidOperatorAndOperandPair(expression)) return false;

  return true;
};

/**
 *
 * @param {string} expressionString
 * @returns {string[]}
 */
const convertExpressionStringToExpressionArray = (expressionString) => {
  const expressionArray = [];

  let tempNumber = "";

  for (const char of expressionString) {
    if (isNumber(char) || char === ".") {
      tempNumber += char;
    } else {
      if (tempNumber.length > 0) {
        expressionArray.push(tempNumber);
        tempNumber = "";
      }

      expressionArray.push(char);
    }
  }

  if (tempNumber) expressionArray.push(tempNumber);

  return expressionArray;
};

const getOperatorPriority = (operator) => {
  return { "+": 1, "-": 1, "*": 2, "/": 2 }[operator] || 0;
};

/**
 *
 * @param {string[]} expressionArray
 * @returns {string[]}
 */
const convertInfixToPostFix = (expressionArray) => {
  const resultQueue = [];
  const stack = [];

  //1.숫자
  //결과 큐에 바로 추가

  //2.연산자
  //스택의 top 연산자보다 우선순위가 낮거나 같으면, 스택에서 꺼내서 결과 큐에 추가
  //그 후에 스택에 push

  //3.왼쪽 괄호
  //스택에 push

  //4.오른쪽 괄호
  //왼쪽 괄호가 나올때 까지 스택에서 pop 하여 결과 큐에 추가

  expressionArray.forEach((target) => {
    if (isNumber(target)) {
      resultQueue.push(target);
    } else if (isOperator(target)) {
      while (
        stack.length &&
        getOperatorPriority(stack[stack.length - 1]) >=
          getOperatorPriority(target)
      ) {
        resultQueue.push(stack.pop());
      }
      stack.push(target);
    } else if (target === "(") {
      stack.push(target);
    } else if (target === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") {
        resultQueue.push(stack.pop());
      }
      stack.pop(); // remove '('
    }
  });

  while (stack.length > 0) {
    resultQueue.push(stack.pop());
  }

  return resultQueue;
};

/**
 *
 * @param {string[]} postfixArray
 * @returns {string}
 */
const evaluatePostFix = (postfixArray) => {
  const stack = [];

  postfixArray.forEach((target) => {
    if (isNumber(target)) {
      stack.push(target);
    } else {
      const secondOperand = Number(stack.pop());
      const firstOperand = Number(stack.pop());

      if (target === "+") {
        stack.push(firstOperand + secondOperand);
      } else if (target === "-") {
        stack.push(firstOperand - secondOperand);
      } else if (target === "*") {
        stack.push(firstOperand * secondOperand);
      } else if (target === "/") {
        stack.push(firstOperand / secondOperand);
      }
    }
  });

  return stack[0];
};

//######### 메인 로직 ##########

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const value = e.target.innerText;

    if (isEqualSign(value)) {
      const expressionString = insertMultiplyBetweenNumberAndParentheses(
        expressionDisplay.innerText
      );

      if (!isValidExpression(expressionString)) {
        alert("유효하지 않은 식입니다!");
        expressionDisplay.innerText = "0";
        return;
      }

      const expressionArray =
        convertExpressionStringToExpressionArray(expressionString);

      const postFix = convertInfixToPostFix(expressionArray);

      const result = evaluatePostFix(postFix);

      resultDisplay.innerText = `${expressionString} = ${result}`;
      expressionDisplay.innerText = "0";
    } else if (isClear(value)) {
      expressionDisplay.innerText = "0";
    } else {
      if (expressionDisplay.innerText === "0") {
        expressionDisplay.innerText = value;
      } else {
        expressionDisplay.innerText += value;
      }
    }
  });
});
