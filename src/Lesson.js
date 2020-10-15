import React, { Component } from "react";
// import questions from "./latestQuestions.json";

const url = 'https://lq74o91d7g.execute-api.us-west-2.amazonaws.com/beta/getQns'


const ProgressBar = ({ percent, retryQuestion, nextQuestion }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <div
      style={{ flex: 1, color: "#888", fontSize: 50, cursor: "pointer" }}
      onClick={retryQuestion}>
        &#10226;
    </div>
    <div
      style={{
        flex: 9,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          height: 5,
          background: "#888",
          display: "flex",
          alignItems: "center"
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: 10,
            background: "#FF9900",
            borderRadius: 100,
            transition: "width 0.5s linear"
          }}
        />
      </div>
    </div>
    <div 
      style={{ flex: 1, color: "#888", fontSize: 50, cursor: "pointer" }}
      onClick={nextQuestion}>
        &#10227;
    </div>
  </div>
);

const Line = () => (
  <div
    style={{ background: "#ccc", width: "100%", height: 2, margin: "50px 0" }}
  />
);

const SelectedBlocks = ({ blocks, selectedBlockIds, unselectBlock }) => {
  const selectedBlocks = selectedBlockIds.map(blockId =>
    blocks.find(b => b.id === blockId)
  );
  return (
    <div
        style={{
        display: "flex",
        width: "100%",
        flexWrap: "wrap",
        alignContent: "center",
        height: `${blocks.length + 15}%`,
        visibility: "hidden"
      }}
    >
      <div style={{ position: "absolute", width: "100%", zIndex: -1 }}>
        <Line />
        <Line />
        <Line />
      </div>
      {selectedBlocks.map(block => (
        <div
          key={block.id}
          style={{
            background: "white",
            color: "black",
            padding: 10,
            margin: 5,
            cursor: "pointer",
            userSelect: "none"
          }}
          onClick={() => {
            showMovingBlock(block.id, false);
            unselectBlock(block.id);
          }}
          id={`selected-block-${block.id}`}
        >

        <div dangerouslySetInnerHTML={{ __html: block.text }} />

        </div>
      ))}
    </div>
  );
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const showMovingBlock = async (id, isBeingSelected) => {
  const startTime = Date.now();
  const duration = 100;
  while (
    !document.getElementById(`selected-block-${id}`) ||
    !document.getElementById(`unselected-block-${id}`)
  ) {
    await sleep(0);
  }
  let startEl = document.getElementById(`selected-block-${id}`);
  let endEl = document.getElementById(`unselected-block-${id}`);
  if (isBeingSelected) [startEl, endEl] = [endEl, startEl];
  const [{ x: startX, y: startY }, { x: endX, y: endY }] = [startEl, endEl].map(
    e => e.getBoundingClientRect()
  );
  const [dx, dy] = [endX - startX, endY - startY];
  endEl.style.visibility = "hidden";

  const movingBlock = document.createElement("div");
  movingBlock.textContent = startEl.textContent;
  movingBlock.style.position = "absolute";
  movingBlock.style.left = startX + "px";
  movingBlock.style.top = startY + "px";
  movingBlock.style.padding = "10px";
  movingBlock.style.background = "white";
  document.body.appendChild(movingBlock);

  (function moveBlock() {
    const now = Date.now();
    if (now >= startTime + duration) {
      endEl.style.visibility = "initial";
      return movingBlock.parentNode.removeChild(movingBlock);
    }
    const percentage = (now - startTime) / duration;
    const x = startX + dx * percentage;
    const y = startY + dy * percentage;
    movingBlock.style.left = x + "px";
    movingBlock.style.top = y + "px";
    requestAnimationFrame(moveBlock);
  })();
};

const UnselectedBlocks = ({ blocks, selectedBlockIds, selectBlock }) => (
  <div
    style={{
      display: "flex",
      width: "100%",
      flexWrap: "wrap",
      alignContent: "center",
      height: `${blocks.length}%`
    }}
  >
    {blocks.map(block => {
      const isSelected = selectedBlockIds.includes(block.id);
      return (
        <div
          key={block.id}
          style={{
            background: isSelected ? "#aaa" : "white",
            color: isSelected ? "#aaa" : "black",
            padding: 10,
            margin: 5,
            cursor: "pointer",
            userSelect: "none"
          }}
          onClick={() => {
            if (!isSelected) {
              showMovingBlock(block.id, true);
              selectBlock(block.id);
            }
          }}
          id={`unselected-block-${block.id}`}
        >
        <div dangerouslySetInnerHTML={{ __html: block.text }} />
        </div>
      );
    })}
  </div>
);

const buttonState = {
  cannotAnswer: 1,
  canAnswer: 2,
  answered: 3
};

const CheckButton = ({ state, checkAnswer, nextQuestion }) => (
  <div
    style={{
      width: "100%",
      color: state === buttonState.cannotAnswer ? "#888" : "black",
      background: state === buttonState.cannotAnswer ? "#ccc" : "#FF9900",
      height: 50,
      bottom: "-5%",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 100,
      cursor: "pointer"
    }}
    onClick={() => {
      if (state === buttonState.canAnswer) {
        checkAnswer();
      } else if (state === buttonState.answered) {
        nextQuestion();
      }
    }}
  >
    {state === buttonState.answered ? "CONTINUE" : "CHECK"}
  </div>
);

const Results = ({ answered, isCorrect, solution }) =>
  answered ? (
    <div
      style={{
        position: "relative",
        width: "100%",
        bottom: "25%",
        padding: 20,
        boxSizing: "border-box",
        color: isCorrect ? "black" : "white",
        background: isCorrect ? "#0EAD69" : "#641220",
        contentAlign: "center",
        textAlign: "center"
      }}
    >
      {isCorrect ? (
        <div><p>That's correct!</p></div>
      ) : (
        <div>
          <div dangerouslySetInnerHTML={{ __html: solution }} />
        </div>
      )}
    </div>
  ) : null;

const selectBlock = blockId => ({ selectedBlockIds }) => ({
  selectedBlockIds: selectedBlockIds.concat(blockId)
});

const unselectBlock = blockId => ({ selectedBlockIds }) => ({
  selectedBlockIds: selectedBlockIds.filter(id => id !== blockId)
});

class Lesson extends Component {
  state = {
    questions: [],
    questionIndex: 0,
    selectedBlockIds: [],
    answered: false,

    article: [],
    sentence: [], 
    solutions: [], 
    blocks: []

  };

  async componentDidMount() {
    const questions = await fetch(url).then(res => res.json())
    this.setState({ questions }) 
    console.log(questions)

    var questionIndex = 0
    var { article, sentence, solutions, blocks } = questions[questionIndex]
    this.setState({ questionIndex, article, sentence, solutions, blocks }) 

  };

  render() {
    const {
      questions,
      questionIndex,
      selectedBlockIds,
      answered,

      article,
      sentence,
      solutions,
      blocks

    } = this.state;


    const checkAnswer = ({
    questionIndex,
    correctAnswers,
    selectedBlockIds
  }) => {
    const { solutions, blocks } = questions[questionIndex];
    return {
      correctAnswers:
        correctAnswers +
        (solutions.includes(
          selectedBlockIds.map(id => blocks.find(b => b.id === id).text).join("")
        )
          ? 1
          : 0),
      answered: true
    };
  };

  const nextQuestion = ({ questionIndex }) => ({
    questionIndex: (questionIndex + 1) % questions.length,
    article: questions[(questionIndex + 1) % questions.length]["article"],
    sentence: questions[(questionIndex + 1) % questions.length]["sentence"],
    solutions: questions[(questionIndex + 1) % questions.length]["solutions"],
    blocks: questions[(questionIndex + 1) % questions.length]["blocks"],
    selectedBlockIds: [],
    answered: false,
  });

  const retryQuestion = ({ questionIndex }) => ({
    questionIndex: (questionIndex) % questions.length,
    article: questions[questionIndex % questions.length ]["article"],
    sentence: questions[questionIndex % questions.length]["sentence"],
    solutions: questions[questionIndex % questions.length]["solutions"],
    blocks: questions[questionIndex % questions.length]["blocks"],
    selectedBlockIds: [],
    answered: false,
  });
  

    return (
      <div
        style={{
          maxWidth: 450,
          margin: "0 auto",
          padding: "0 1em",
          height: "100vh"
        }}
      >
        <ProgressBar
          percent={questionIndex / questions.length * 100}
          retryQuestion={() => this.setState(retryQuestion)}
          nextQuestion={() => this.setState(nextQuestion)}
        />
        <h6 style = {{ textAlign: "center"}}>
        source: {article}
        <p>_________</p>
        </h6>

        <div style={{ textAlign: "center", marginBottom: 20, marginTop: 50 }}>
          {sentence.map(({ text }, i) => (
            <span
              key={i}
              style={{
                margin: 5,
                paddingBottom: 5
              }}
            >
              {text}
            </span>
          ))}
        </div>

        <SelectedBlocks
          blocks={blocks}
          selectedBlockIds={selectedBlockIds}
          unselectBlock={id => this.setState(unselectBlock(id))}
        />
        <UnselectedBlocks
          blocks={blocks}
          selectedBlockIds={selectedBlockIds}
          selectBlock={id => this.setState(selectBlock(id))}
        />
        <CheckButton
          state={
            answered
              ? buttonState.answered
              : selectedBlockIds.length === 0
                ? buttonState.cannotAnswer
                : buttonState.canAnswer
          }
          checkAnswer={() => this.setState(checkAnswer)}
          nextQuestion={() => this.setState(nextQuestion)}
        />
        <Results
          answered={answered}
          isCorrect={solutions.includes(
            selectedBlockIds
              .map(id => blocks.find(b => b.id === id).text)
              .join("")
          )}
          solution={solutions[0]}
        />
      </div>
    );
  }
}

export default Lesson;