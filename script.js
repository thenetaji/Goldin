      let targetH, targetL, targetS;
      let timeLeft = 60;
      let timerInterval;
      let gameActive = false;
      let selectedMode = null;
      let lastScore = null;
      let timeLeftAtSubmit = 0;

      const modeConfig = {
        easy: { time: 90, lightMin: 50, lightMax: 100, satMin: 60, satMax: 100 },
        medium: { time: 60, lightMin: 30, lightMax: 70, satMin: 40, satMax: 80 },
        hard: { time: 40, lightMin: 10, lightMax: 50, satMin: 20, satMax: 60 }
      };

      const hueSlider = document.getElementById("hueSlider");
      const lightnessSlider = document.getElementById("lightnessSlider");
      const saturationSlider = document.getElementById("saturationSlider");

      const hueValue = document.getElementById("hueValue");
      const lightnessValue = document.getElementById("lightnessValue");
      const saturationValue = document.getElementById("saturationValue");

      const targetColorBox = document.getElementById("targetColor");
      const yourColorBox = document.getElementById("yourColor");
      const timerDisplay = document.getElementById("timer");
      const submitBtn = document.getElementById("submitBtn");
      const newGameBtn = document.getElementById("newGameBtn");
      const resultDiv = document.getElementById("result");
      const scoreInfo = document.getElementById("scoreInfo");
      const homeScreen = document.getElementById("homeScreen");
      const gameContainer = document.getElementById("gameContainer");
      const playBtn = document.getElementById("playBtn");
      const resultModal = document.getElementById("resultModal");
      const modalResult = document.getElementById("modalResult");
      const modalScore = document.getElementById("modalScore");
      const nextGameBtn = document.getElementById("nextGameBtn");
      const shareBtn = document.getElementById("shareBtn");
      const modalMode = document.getElementById("modalMode");
      const modalTimeLeft = document.getElementById("modalTimeLeft");
      const scoreCanvas = document.getElementById("scoreCanvas");
      const easyBtn = document.getElementById("easyBtn");
      const mediumBtn = document.getElementById("mediumBtn");
      const hardBtn = document.getElementById("hardBtn");

      function generateRandomColor() {
        const config = modeConfig[selectedMode];
        targetH = Math.floor(Math.random() * 361);
        targetL = Math.floor(Math.random() * (config.lightMax - config.lightMin + 1)) + config.lightMin;
        targetS = Math.floor(Math.random() * (config.satMax - config.satMin + 1)) + config.satMin;

        targetColorBox.style.background = `hsl(${targetH}, ${targetS}%, ${targetL}%)`;
      }

      function updateYourColor() {
        const h = hueSlider.value;
        const l = lightnessSlider.value;
        const s = saturationSlider.value;

        yourColorBox.style.background = `hsl(${h}, ${s}%, ${l}%)`;

        hueValue.textContent = `${h}°`;
        lightnessValue.textContent = `${l}%`;
        saturationValue.textContent = `${s}%`;
      }

      function startTimer() {
        const config = modeConfig[selectedMode];
        timeLeft = config.time;
        timerDisplay.textContent = `${timeLeft}s`;
        timerDisplay.classList.remove("warning");

        timerInterval = setInterval(() => {
          timeLeft--;
          timerDisplay.textContent = `${timeLeft}s`;

          if (timeLeft <= 10) {
            timerDisplay.classList.add("warning");
          }

          if (timeLeft === 0) {
            clearInterval(timerInterval);
            endGame(true);
          }
        }, 1000);
      }

      function calculateScore() {
        const h = parseInt(hueSlider.value);
        const l = parseInt(lightnessSlider.value);
        const s = parseInt(saturationSlider.value);

        let hueDiff = Math.abs(h - targetH);
        if (hueDiff > 180) hueDiff = 360 - hueDiff;

        const lightnessDiff = Math.abs(l - targetL);
        const saturationDiff = Math.abs(s - targetS);

        const totalDiff = hueDiff * 2 + lightnessDiff + saturationDiff;

        const maxDiff = 180 * 2 + 100 + 100;
        const score = Math.max(
          0,
          Math.round(100 - (totalDiff / maxDiff) * 100),
        );

        return {
          score,
          hueDiff,
          lightnessDiff,
          saturationDiff,
        };
      }

      function endGame(timeout = false) {
        clearInterval(timerInterval);
        gameActive = false;
        submitBtn.disabled = true;
        hueSlider.disabled = true;
        lightnessSlider.disabled = true;
        saturationSlider.disabled = true;

        if (timeout) {
          modalResult.textContent = "Time's Up!";
          modalResult.className = "modal-result try-again";
          modalScore.textContent = "Try again and see if you can match it faster!";
          modalMode.textContent = `Mode: ${selectedMode.toUpperCase()}`;
          modalTimeLeft.textContent = "Time Left: 0s";
          lastScore = null;
          timeLeftAtSubmit = 0;
          showResultModal();
          return;
        }

        const result = calculateScore();
        lastScore = result;
        timeLeftAtSubmit = timeLeft;

        let resultClass, resultText;
        if (result.score >= 90) {
          resultClass = "excellent";
          resultText = "Perfect Match!";
        } else if (result.score >= 75) {
          resultClass = "excellent";
          resultText = "Excellent!";
        } else if (result.score >= 60) {
          resultClass = "good";
          resultText = "Good Job!";
        } else if (result.score >= 40) {
          resultClass = "good";
          resultText = "Not Bad!";
        } else {
          resultClass = "try-again";
          resultText = "Try Again!";
        }

        modalResult.className = `modal-result ${resultClass}`;
        modalResult.textContent = `${resultText} Score: ${result.score}/100`;

        modalScore.textContent = `H: ${result.hueDiff}° off | L: ${result.lightnessDiff}% off | S: ${result.saturationDiff}% off`;
        modalMode.textContent = `Mode: ${selectedMode.toUpperCase()}`;
        modalTimeLeft.textContent = `Time Left: ${timeLeftAtSubmit}s`;
        
        showResultModal();
      }

      function showResultModal() {
        resultModal.classList.add("show");
      }

      function hideResultModal() {
        resultModal.classList.remove("show");
      }

      function showHomeScreen() {
        homeScreen.style.display = "flex";
        gameContainer.style.display = "none";
      }

      function showGameScreen() {
        homeScreen.style.display = "none";
        gameContainer.style.display = "block";
      }

      function startNewGame() {
        generateRandomColor();

        hueSlider.value = 180;
        lightnessSlider.value = 50;
        saturationSlider.value = 50;
        updateYourColor();

        resultDiv.className = "result";
        resultDiv.textContent = "";
        scoreInfo.textContent = "";

        hueSlider.disabled = false;
        lightnessSlider.disabled = false;
        saturationSlider.disabled = false;
        submitBtn.disabled = false;

        gameActive = true;
        startTimer();
      }

      function generateScoreImage() {
        const width = 800;
        const height = 600;
        const ctx = scoreCanvas.getContext("2d");
        
        scoreCanvas.width = width;
        scoreCanvas.height = height;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#667eea");
        gradient.addColorStop(1, "#764ba2");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // White content box
        const boxPadding = 40;
        ctx.fillStyle = "white";
        ctx.fillRect(boxPadding, boxPadding, width - boxPadding * 2, height - boxPadding * 2);

        // Title
        ctx.fillStyle = "#333";
        ctx.font = "bold 36px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎨 Color Match Challenge", width / 2, 100);

        // Score result
        ctx.font = "bold 48px Arial, sans-serif";
        const resultText = modalResult.textContent.split(" Score:")[0];
        ctx.fillText(resultText, width / 2, 180);

        // Score number
        ctx.font = "bold 60px Arial, sans-serif";
        ctx.fillStyle = "#667eea";
        const scoreText = lastScore ? `${lastScore.score}/100` : "0/100";
        ctx.fillText(scoreText, width / 2, 280);

        // Mode and time
        ctx.fillStyle = "#333";
        ctx.font = "20px Arial, sans-serif";
        ctx.fillText(`Mode: ${selectedMode.toUpperCase()}`, width / 2, 350);
        ctx.fillText(`Time Left: ${timeLeftAtSubmit}s`, width / 2, 390);

        // Details
        if (lastScore) {
          ctx.font = "16px Arial, sans-serif";
          ctx.fillStyle = "#666";
          ctx.fillText(`Hue: ${lastScore.hueDiff}° off | Lightness: ${lastScore.lightnessDiff}% off | Saturation: ${lastScore.saturationDiff}% off`, width / 2, 450);
        }

        // Share text
        ctx.font = "italic 14px Arial, sans-serif";
        ctx.fillStyle = "#999";
        ctx.fillText("Check out my Color Match Challenge score!", width / 2, 520);

        return scoreCanvas.toDataURL("image/png");
      }

      function shareScore() {
        const imageData = generateScoreImage();
        
        // Create a temporary link to download
        const link = document.createElement("a");
        link.href = imageData;
        link.download = `colormatch-score-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // If WebShare API is available, also try to share
        if (navigator.share) {
          fetch(imageData)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], "score.png", { type: "image/png" });
              navigator.share({
                title: "🎨 Color Match Challenge",
                text: `Check out my score! Mode: ${selectedMode.toUpperCase()}, Time Left: ${timeLeftAtSubmit}s`,
                files: [file]
              });
            })
            .catch(err => console.log("Share failed:", err));
        }
      }

      hueSlider.addEventListener("input", updateYourColor);
      lightnessSlider.addEventListener("input", updateYourColor);
      saturationSlider.addEventListener("input", updateYourColor);

      submitBtn.addEventListener("click", () => {
        if (gameActive) {
          endGame(false);
        }
      });

      newGameBtn.addEventListener("click", () => {
        startNewGame();
      });

      easyBtn.addEventListener("click", () => {
        selectMode("easy");
      });

      mediumBtn.addEventListener("click", () => {
        selectMode("medium");
      });

      hardBtn.addEventListener("click", () => {
        selectMode("hard");
      });

      nextGameBtn.addEventListener("click", () => {
        hideResultModal();
        showHomeScreen();
      });

      shareBtn.addEventListener("click", shareScore);

      function selectMode(mode) {
        selectedMode = mode;
        updateModeButtons();
        showGameScreen();
        startNewGame();
      }

      function updateModeButtons() {
        easyBtn.classList.remove("selected");
        mediumBtn.classList.remove("selected");
        hardBtn.classList.remove("selected");

        if (selectedMode === "easy") {
          easyBtn.classList.add("selected");
        } else if (selectedMode === "medium") {
          mediumBtn.classList.add("selected");
        } else if (selectedMode === "hard") {
          hardBtn.classList.add("selected");
        }
      }

      showHomeScreen();