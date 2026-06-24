// ================================================================
// AI Career Path Pro — PRISM Engine
// Holographic iridescent interface with prismatic interactions
// ================================================================

// ===== Utility =====
const $ = id => document.getElementById(id);

// ================================================================
// DYNAMIC LOGO BACKGROUND CLEANER (Checkerboard Remover)
// ================================================================
(function () {
  const img = new Image();
  img.src = 'logo.png';
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    try {
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        
        // Background is gray/black checkerboard
        // Check for low saturation (R, G, B are very close)
        const diffRG = Math.abs(r - g);
        const diffGB = Math.abs(g - b);
        const isGrayscale = diffRG < 15 && diffGB < 15;
        
        // Dark pixels (below 55) or Light pixels (above 200) representing background checkerboard squares
        const isBackground = isGrayscale && (r < 55 || r > 200);
        
        if (isBackground) {
          data[i+3] = 0; // Set alpha to fully transparent
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const transparentDataUrl = canvas.toDataURL('image/png');
      
      // Replace all instances on the page
      document.querySelectorAll('img[src="logo.png"]').forEach(el => {
        el.src = transparentDataUrl;
      });
      const hiddenLogo = document.getElementById('hiddenLogoImg');
      if (hiddenLogo) {
        hiddenLogo.src = transparentDataUrl;
      }
    } catch (e) {
      console.warn("Could not dynamically clean logo background:", e);
    }
  };
})();

// ================================================================
// SYNTHESIZED AUDIO ENGINE
// ================================================================
const AudioEngine = (() => {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    return ctx;
  }

  function play(freq, duration, type = 'sine', volume = 0.06) {
    if (!enabled) return;
    const ac = getCtx();
    if (!ac) return;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  }

  return {
    click() { play(1100, 0.06, 'sine', 0.04); },
    select() { play(800, 0.1, 'sine', 0.05); },
    success() {
      play(523, 0.15, 'sine', 0.05);
      setTimeout(() => play(659, 0.15, 'sine', 0.05), 100);
      setTimeout(() => play(784, 0.2, 'sine', 0.05), 200);
    },
    warning() { play(330, 0.2, 'triangle', 0.04); },
    chime() {
      play(523, 0.3, 'sine', 0.04);
      setTimeout(() => play(659, 0.25, 'sine', 0.04), 120);
      setTimeout(() => play(784, 0.25, 'sine', 0.04), 240);
      setTimeout(() => play(1047, 0.4, 'sine', 0.05), 360);
    },
    setEnabled(val) { enabled = val; },
    isEnabled() { return enabled; }
  };
})();

// ================================================================
// NAVBAR AUTO-HIDE ON SCROLL
// ================================================================
(function () {
  const nav = $('navIsland');
  if (!nav) return;
  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScroll && currentScroll > 100) {
          nav.classList.add('nav-hidden');
        } else {
          nav.classList.remove('nav-hidden');
        }
        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ================================================================
// SETTINGS PANEL
// ================================================================
(function () {
  const toggle = $('settingsToggle');
  const overlay = $('settingsOverlay');
  const panel = $('settingsPanel');

  if (!toggle || !overlay) return;

  function openSettings() {
    overlay.classList.add('active');
    AudioEngine.click();
  }

  function closeSettings() {
    overlay.classList.remove('active');
  }

  toggle.addEventListener('click', () => {
    if (overlay.classList.contains('active')) closeSettings();
    else openSettings();
  });

  // Click outside panel to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSettings();
  });

  // Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeSettings();
    }
  });

  // Theme toggle
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.themeVal;
      document.documentElement.setAttribute('data-theme', val);
      document.querySelectorAll('.theme-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      localStorage.setItem('theme', val);
      AudioEngine.click();
    });
  });

  // Accent swatches
  document.querySelectorAll('.accent-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const accent = swatch.dataset.accent;
      document.documentElement.setAttribute('data-accent', accent);
      document.querySelectorAll('.accent-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      localStorage.setItem('accent', accent);
      AudioEngine.click();
    });
  });

  // Sound toggle
  const soundToggle = $('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundToggle.classList.toggle('active');
      const isOn = soundToggle.classList.contains('active');
      soundToggle.setAttribute('aria-checked', isOn);
      AudioEngine.setEnabled(isOn);
      localStorage.setItem('sound', isOn ? 'on' : 'off');
      if (isOn) AudioEngine.click();
    });
  }

  // Restore saved settings
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('.theme-toggle-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.themeVal === savedTheme);
    });
  }

  const savedAccent = localStorage.getItem('accent');
  if (savedAccent) {
    document.documentElement.setAttribute('data-accent', savedAccent);
    document.querySelectorAll('.accent-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.accent === savedAccent);
    });
  }

  const savedSound = localStorage.getItem('sound');
  if (savedSound === 'off') {
    AudioEngine.setEnabled(false);
    if (soundToggle) {
      soundToggle.classList.remove('active');
      soundToggle.setAttribute('aria-checked', 'false');
    }
  }
})();

// ================================================================
// SCROLL REVEAL OBSERVER
// ================================================================
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ================================================================
// APPLICATION STATE
// ================================================================
const state = {
  name: "",
  email: "",
  role: "Data Scientist",
  difficulty: "intermediate",
  questionCount: 10,
  questions: [],
  index: 0,
  answers: [],
  startTime: null,
  timerInterval: null,
  certMode: false,
  certBatchNum: 0,
  certTotalAnswered: 0,
  certCorrect: 0,
  certMinQuestions: 50,
  certBatchSize: 10,
  askedFallbackIndices: []
};

// ================================================================
// SECTION NAVIGATION
// ================================================================
const sections = {
  hero: $('heroSection'),
  features: $('featuresSection'),
  setup: $('setupSection'),
  loading: $('loadingSection'),
  quiz: $('quizSection'),
  results: $('resultsSection'),
  about: $('aboutSection'),
  admin: $('adminSection')
};

function showSection(name) {
  Object.values(sections).forEach(s => { if (s) s.classList.add('hidden'); });
  if (sections[name]) {
    sections[name].classList.remove('hidden');
    sections[name].classList.remove('section-transition');
    void sections[name].offsetWidth;
    sections[name].classList.add('section-transition');
    sections[name].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (name === 'hero') {
    sections.hero.classList.remove('hidden');
    sections.features.classList.remove('hidden');
  }
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const a = document.querySelector(`.nav-link[data-section="${name}"]`);
  if (a) a.classList.add('active');
}

// Nav links
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    AudioEngine.click();
    const s = btn.dataset.section;
    if (s === 'hero') showSection('hero');
    else if (s === 'features') {
      showSection('hero');
      setTimeout(() => {
        sections.features.scrollIntoView({ behavior: 'smooth' });
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        $('navFeatures')?.classList.add('active');
      }, 50);
    }
    else if (s === 'about') showSection('about');
  });
});

// Scroll Highlighting
window.addEventListener('scroll', () => {
  if (!sections.hero.classList.contains('hidden')) {
    const featuresTop = sections.features.getBoundingClientRect().top;
    if (featuresTop < window.innerHeight / 2) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      $('navFeatures')?.classList.add('active');
    } else {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      $('navHome')?.classList.add('active');
    }
  }
});

$('homeLink')?.addEventListener('click', e => { e.preventDefault(); AudioEngine.click(); showSection('hero'); });

$('heroStartBtn')?.addEventListener('click', () => {
  AudioEngine.click();
  state.certMode = false;
  $('questionCountGroup').classList.remove('hidden');
  $('certModeInfo').classList.add('hidden');
  $('noCertHint').style.display = 'flex';
  $('emailOptional').classList.remove('hidden');
  $('emailRequired').classList.add('hidden');
  $('emailCertHint').classList.add('hidden');
  $('emailError').classList.add('hidden');
  showSection('setup');
});

$('heroCertBtn')?.addEventListener('click', () => {
  AudioEngine.click();
  state.certMode = true;
  $('questionCountGroup').classList.add('hidden');
  $('certModeInfo').classList.remove('hidden');
  $('emailOptional').classList.add('hidden');
  $('emailRequired').classList.remove('hidden');
  $('emailCertHint').classList.remove('hidden');
  $('emailError').classList.add('hidden');
  showSection('setup');
});

$('heroLearnBtn')?.addEventListener('click', () => {
  AudioEngine.click();
  sections.features.scrollIntoView({ behavior: 'smooth' });
});

$('backFromSetup')?.addEventListener('click', () => { AudioEngine.click(); showSection('hero'); });
$('closeAboutBtn')?.addEventListener('click', () => { AudioEngine.click(); showSection('hero'); });

$('giveUpBtn')?.addEventListener('click', () => {
  AudioEngine.warning();
  const currentBatchAnswered = state.answers.filter(a => a !== null).length;
  const currentBatchCorrect = state.answers.reduce((acc, a, i) => {
    const q = state.questions[i];
    return acc + (q && a === q.correct ? 1 : 0);
  }, 0);
  state.certCorrect += currentBatchCorrect;
  state.certTotalAnswered += currentBatchAnswered;
  showCertResults();
});

// ================================================================
// TIMER
// ================================================================
function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}

function startTimer() {
  state.startTime = Date.now();
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    const el = $('quizTimer');
    if (el && state.startTime) el.textContent = formatTime(Date.now() - state.startTime);
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
}

// ================================================================
// FALLBACK QUESTIONS
// ================================================================
const fallbackQ = [
  { title: "Which is a key characteristic of a CNN?", options: ["Sliding window for spatial features", "Recurrent connections for sequences", "Unsupervised clustering", "Single hidden layer"], correct: 0, explanation: "CNNs use convolutional filters that slide across input data to detect spatial features and patterns." },
  { title: "What does regularization prevent?", options: ["Bias-variance trade-off", "Vanishing gradients", "Overfitting", "Underfitting"], correct: 2, explanation: "Regularization penalizes model complexity to prevent overfitting." },
  { title: "What is a pivot table used for?", options: ["Create empty dataframe", "Calculate correlations", "Summarize and reorganize data", "Visualize scatter plots"], correct: 2, explanation: "Pivot tables restructure and summarize large datasets." },
  { title: "Classifier vs Regressor?", options: ["Classifier: continuous; Regressor: discrete", "Classifier: unsupervised; Regressor: supervised", "Classifier: discrete labels; Regressor: continuous values", "Classifier: linear; Regressor: non-linear"], correct: 2, explanation: "Classifiers predict categories, regressors predict continuous numbers." },
  { title: "Best output activation for multi-class?", options: ["ReLU", "Sigmoid", "Tanh", "Softmax"], correct: 3, explanation: "Softmax outputs probability distribution across all classes." },
  { title: "Converting categorical data to numerical?", options: ["Standardization", "Normalization", "One-Hot Encoding", "Discretization"], correct: 2, explanation: "One-Hot Encoding creates binary columns per category." },
  { title: "Popular Python visualization library?", options: ["NumPy", "Pandas", "Matplotlib", "Scipy"], correct: 2, explanation: "Matplotlib is Python's foundational plotting library." },
  { title: "K-fold cross-validation is for?", options: ["Speed up training", "Find hyperparameters", "Evaluate on unseen data", "Reduce dimensionality"], correct: 2, explanation: "K-fold CV gives robust performance estimates on unseen data." },
  { title: "Unsupervised learning algorithm?", options: ["Linear Regression", "Decision Tree", "K-Means Clustering", "SVM"], correct: 2, explanation: "K-Means groups data without labels." },
  { title: "Learning rate controls?", options: ["Number of epochs", "Hidden layer size", "Weight update speed", "Input features"], correct: 2, explanation: "Learning rate determines step size during gradient descent." },
  { title: "Decision tree node represents?", options: ["Prediction value", "Feature to split on", "Constant bias", "Final class label"], correct: 1, explanation: "Each node tests a feature for splitting." },
  { title: "F1-score purpose?", options: ["Measure training time", "Balance precision and recall", "Count correct predictions", "Measure bias"], correct: 1, explanation: "F1-score is harmonic mean of precision and recall." },
  { title: "Regression evaluation metric?", options: ["Accuracy", "Confusion Matrix", "MSE", "Precision"], correct: 2, explanation: "MSE measures average squared prediction error." },
  { title: "SVM kernel function?", options: ["Reduce features", "Map to higher dimensions", "Normalize data", "Count support vectors"], correct: 1, explanation: "Kernels map data to higher dimensions for linear separation." },
  { title: "Dimensionality reduction is?", options: ["Removing data points", "Reducing features", "Reducing training set", "Reducing epochs"], correct: 1, explanation: "Reduces features while preserving important information." },
  { title: "NLP token is?", options: ["Document identifier", "Word frequency", "Word or punctuation mark", "Neural network type"], correct: 2, explanation: "Tokenization breaks text into individual units." },
  { title: "Bias-variance trade-off?", options: ["Complexity vs interpretability", "Training vs test performance", "Accuracy vs speed", "Simplicity vs generalization"], correct: 3, explanation: "Finding the sweet spot between underfitting and overfitting." },
  { title: "NumPy is designed for?", options: ["Plotting", "DataFrames", "ML models", "Numerical array operations"], correct: 3, explanation: "NumPy provides efficient multi-dimensional array operations." },
  { title: "Hyperparameter is?", options: ["Learned during training", "Set before training", "Performance metric", "Preprocessing technique"], correct: 1, explanation: "Hyperparameters are set before training begins." },
  { title: "Handling missing data?", options: ["Remove column", "Drop rows", "Impute mean/median", "All of the above"], correct: 3, explanation: "All are valid strategies depending on the situation." },
  { title: "What does the term 'Epoch' mean in deep learning?", options: ["One full pass through the training dataset", "One weight update calculation", "A metric evaluating precision", "Training duration in seconds"], correct: 0, explanation: "An epoch represents one complete iteration through the entire training dataset." },
  { title: "Which activation function is most prone to the 'Dying ReLU' problem?", options: ["Sigmoid", "Tanh", "ReLU", "Leaky ReLU"], correct: 2, explanation: "Standard ReLU can output exactly zero and stop updating when inputs are negative." },
  { title: "Which validation method is best suited for small datasets?", options: ["Holdout validation", "Leave-One-Out cross-validation", "Time-series validation", "No validation"], correct: 1, explanation: "Leave-One-Out cross-validation maximizes data usage for evaluation when sample size is low." },
  { title: "What is data leakage?", options: ["Loss of data during disk backup", "Inclusion of target info in training features", "Accessing unencrypted network streams", "Deleting dataset duplicate columns"], correct: 1, explanation: "Data leakage happens when information from outside the training dataset is used to build the model." },
  { title: "What is the primary objective of a GAN Generator?", options: ["Classify real vs fake images", "Produce realistic synthetic samples", "Optimize learning rate", "Minimize model weights"], correct: 1, explanation: "The generator creates fake samples that mimic the training distribution to fool the discriminator." },
  { title: "What does an ROC-AUC score of 0.5 indicate?", options: ["Perfect classifier accuracy", "Model performance equivalent to random guessing", "Highly biased predictive weights", "Overfitting on testing validation split"], correct: 1, explanation: "An AUC of 0.5 indicates the model has no discriminative ability, identical to a coin flip." },
  { title: "What is the role of a feature store in ML systems?", options: ["To store models offline", "To manage and serve features consistently", "To clean database logs", "To host REST endpoints"], correct: 1, explanation: "Feature stores catalog, manage, and serve ML features for both training and online inference." },
  { title: "What does the self-attention mechanism in Transformers compute?", options: ["Statistical mean of text blocks", "Relevance of each word relative to all other words", "Linear regressions for sequences", "Loss values per sequence"], correct: 1, explanation: "Self-attention dynamically calculates a weight distribution relating each token to every other token in the input." },
  { title: "Which of the following describes L2 Regularization (Ridge)?", options: ["Adds absolute value of weights penalty", "Adds squared magnitude of weights penalty", "Drops random neurons during training", "Restricts maximum layer depth"], correct: 1, explanation: "L2 regularization penalizes the sum of the squared weights (adds L2 norm to the loss function)." },
  { title: "What is the main benefit of model quantization?", options: ["Increases theoretical accuracy", "Reduces model size and increases inference speed", "Expands feature dimensionality", "Avoids underfitting"], correct: 1, explanation: "Quantization maps model weights to lower-precision representations (e.g., 32-bit floats to 8-bit ints) to save resource usage." },
  { title: "In NLP, what is the purpose of tokenization?", options: ["Adding tags to text segments", "Breaking text into words or subwords", "Scraping raw corpus datasets", "Converting characters to unicode numbers"], correct: 1, explanation: "Tokenization splits raw string sentences into atomic tokens (words/subwords) for vectorization." },
  { title: "What is the primary difference between a Random Forest and a Decision Tree?", options: ["Random Forest is unsupervised", "Random Forest uses an ensemble of multiple trees", "Decision Trees are faster at training", "Decision Trees do not overfit"], correct: 1, explanation: "Random Forest is an ensemble of decision trees trained with bootstrap aggregating (bagging) and random feature selection." },
  { title: "What is the primary function of anchor boxes in YOLO object detection?", options: ["Normalize bounding box coordinates", "Predict initial scale/ratio variations for objects", "Remove overlapping boxes", "Apply image augmentation"], correct: 1, explanation: "Anchor boxes provide predefined shape and ratio priors that YOLO uses to predict precise target bounding box boundaries." },
  { title: "What does RAG stand for in modern Large Language Model architectures?", options: ["Recursive Attention Gate", "Retrieval-Augmented Generation", "Random Attribute Generator", "Refactored Alignment Gradient"], correct: 1, explanation: "RAG augments LLM generation by retrieving context documents from external databases dynamically." },
  { title: "What is a main issue with Gradient Descent when the learning rate is too large?", options: ["Model fails to update weights", "Model diverges and fails to converge", "Training runs extremely slowly", "Gradient vanishes in output layers"], correct: 1, explanation: "Too high learning rates cause weight updates to overshoot the local minimum, causing divergence." },
  { title: "What is the purpose of pooling layers in a CNN?", options: ["Introduce non-linearities", "Reduce spatial dimensions and parameter counts", "Compute feature cross-products", "Map outputs to probabilities"], correct: 1, explanation: "Pooling downsamples feature maps (e.g., Max Pooling) to reduce computational load and control overfitting." },
  { title: "In classification, what does a high precision score indicate?", options: ["Low false negative rate", "Low false positive rate", "Perfect recall accuracy", "Minimal training duration"], correct: 1, explanation: "High precision indicates that when the model predicts the positive class, it is highly likely to be correct." },
  { title: "What does the term 'temperature' control in LLM text generation?", options: ["Number of tokens generated", "Randomness and creativity of next-token selection", "Maximum GPU execution heat", "Prompt processing delay"], correct: 1, explanation: "Lower temperatures generate more deterministic text; higher values make outputs more varied and creative." },
  { title: "Which metric is most appropriate for evaluating an imbalanced classification problem?", options: ["Accuracy", "F1-Score / Precision-Recall AUC", "Mean Squared Error", "R-squared"], correct: 1, explanation: "Accuracy is highly misleading for imbalanced datasets; F1-score provides a balanced metric of precision and recall." },
  { title: "What does the bias-variance trade-off represent?", options: ["CPU vs GPU processing speed", "Model simplicity vs generalization ability", "Training duration vs storage footprint", "Linear vs multi-layer complexity"], correct: 1, explanation: "It represents balancing underfitting (high bias due to simple models) and overfitting (high variance due to complex models)." },
  { title: "What is the key advantage of PyTorch over older TensorFlow versions?", options: ["Support for static graphs", "Dynamic computation graph (Eager mode by default)", "Requires less training epochs", "Higher raw model precision"], correct: 1, explanation: "PyTorch's dynamic graph model allows interactive debugging and pythonic execution workflows." },
  { title: "What is the purpose of the encoder in an Autoencoder?", options: ["Classify labels in training set", "Compress input into a low-dimensional bottleneck representation", "Reconstruct images from noise", "Compute prediction matrices"], correct: 1, explanation: "The encoder maps high-dimensional input data down to a latent space bottleneck vector." },
  { title: "Which technique helps prevent vanishing gradients in recurrent networks?", options: ["Standard SGD", "Using LSTM or GRU cells", "Decreasing sequence length", "Dropping pooling layers"], correct: 1, explanation: "LSTM/GRU gates control information flow, enabling gradients to pass through time without shrinking exponentially." },
  { title: "What is the purpose of learning rate scheduling?", options: ["Schedule train epochs across days", "Dynamically decay learning rate during training", "Calculate overall dataset scale", "Balance precision and recall"], correct: 1, explanation: "Decaying learning rates over time helps the optimizer settle cleanly into local minima near the end of training." },
  { title: "What does PCA stand for in unsupervised learning?", options: ["Projected Clustering Analysis", "Principal Component Analysis", "Pearson Correlation Array", "Polymorphic Concept Association"], correct: 1, explanation: "Principal Component Analysis is an orthogonal linear transformation for dimensionality reduction." },
  { title: "Which model deployment framework is optimized for running models on mobile devices?", options: ["Docker Compose", "TensorFlow Lite / PyTorch Mobile", "Kubeflow Pipelines", "Triton Inference Server"], correct: 1, explanation: "TFLite and PyTorch Mobile provide specialized operators, quantization, and runtimes for mobile chips." },
  { title: "What is the main benefit of transfer learning?", options: ["Fewer target training data and epochs required", "Guarantees zero model validation loss", "Avoids any preprocessing requirements", "Enables model weights to double"], correct: 0, explanation: "Transfer learning reuses features from large pre-trained models, allowing rapid learning on small datasets." },
  { title: "What is the purpose of cross-entropy loss?", options: ["Measure spatial distances in images", "Quantify difference between probability distributions", "Penalize model parameter complexity", "Calculate baseline statistical mean"], correct: 1, explanation: "Cross-entropy computes the divergence between target classification distributions and predicted probabilities." },
  { title: "In computer vision, what is image segmentation?", options: ["Splitting datasets into train/test sets", "Classifying every pixel in the image", "Cropping borders out of pictures", "Downsampling color depth"], correct: 1, explanation: "Semantic or instance segmentation labels every individual pixel in an image with a class category." },
  { title: "What does fine-tuning a model refer to?", options: ["Adding standard comments to source code", "Slightly training a pre-trained model on custom data", "Manually adjusting learning rate values", "Selecting optimal dataset formats"], correct: 1, explanation: "Fine-tuning takes a model trained on large general tasks and adapts its weights slightly for a specific downstream dataset." },
  { title: "What is the primary function of the discriminator in a GAN?", options: ["Generate synthetic realistic samples", "Distinguish between real and generated samples", "Quantize deep neural network weights", "Calculate learning rate decays"], correct: 1, explanation: "The discriminator acts as a binary classifier evaluating whether a given input sample is real or fake." },
  { title: "Which algorithm is commonly used for recommendation systems?", options: ["Principal Component Analysis", "Collaborative Filtering", "Binary Cross-Entropy", "Linear Discriminant Analysis"], correct: 1, explanation: "Collaborative filtering predicts user preferences based on past ratings or interactions of similar users." },
  { title: "What is the purpose of gradient clipping?", options: ["Stopping neural training early", "Preventing exploding gradients by capping values", "Removing unused layers from graphs", "Reducing maximum dataset sizes"], correct: 1, explanation: "Gradient clipping scales down gradient updates that exceed a threshold to keep optimization stable." },
  { title: "What is a key difference between Bagging and Boosting?", options: ["Bagging trains models sequentially; Boosting trains in parallel", "Bagging trains models in parallel; Boosting trains sequentially", "Bagging is for classification; Boosting is for regression", "Bagging changes weights; Boosting shuffles inputs"], correct: 1, explanation: "Bagging runs independent models in parallel, whereas Boosting trains models sequentially, focusing on errors made by previous models." },
  { title: "What does the term 'perplexity' measure in language modeling?", options: ["Maximum sequence context length", "How well a probability model predicts a sample", "Inference token decoding latency", "Tokenizer vocabulary byte counts"], correct: 1, explanation: "Perplexity measures the branching factor of text predictions; lower perplexity indicates a better model." },
  { title: "What does mean Average Precision (mAP) measure?", options: ["Averaged training speed in seconds", "Precision of bounding boxes across class thresholds", "Total system calculation reliability", "Difference between target distributions"], correct: 1, explanation: "mAP is the standard evaluation metric for object detection, measuring average precision across IoU thresholds." },
  { title: "Which tool is commonly used to containerize ML models for deployment?", options: ["Webpack", "Docker", "Pandas", "PyTorch"], correct: 1, explanation: "Docker creates portable container files enclosing all dependencies required to execute the model environment." },
  { title: "What is the purpose of early stopping during neural network training?", options: ["Save energy bills when loss hits zero", "Prevent overfitting when validation loss starts rising", "Truncate input token sequences", "Halt processes when client disconnects"], correct: 1, explanation: "Early stopping monitors validation metrics and halts training before the model overfits the training set." },
  { title: "What does the term 'feature engineering' mean?", options: ["Editing deep layers of model graphs", "Creating new predictors from raw input datasets", "Compiling software libraries using C++", "Selecting the model's loss function"], correct: 1, explanation: "Feature engineering transforms raw variable data into predictive columns designed to help algorithms learn better." },
  { title: "What does a high recall score indicate?", options: ["Very few false positives were predicted", "Very few false negatives were missed", "Perfect learning convergence rate", "Low overall classification accuracy"], correct: 1, explanation: "High recall indicates the model is highly effective at capturing all actual positive cases in the dataset." }
];

// ================================================================
// API CALLS
// ================================================================
async function fetchQuestions(count, diff) {
  const { role, difficulty } = state;
  const d = diff || difficulty;
  const c2 = count || state.questionCount;
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, difficulty: d, count: c2 })
    });
    const data = await res.json();
    if (data.questions?.length > 0) return data.questions;
  } catch (e) { console.warn('API unavailable:', e); }

  // Filter out already asked fallback questions in this session to prevent repetition
  const availableFallback = fallbackQ.filter((q, idx) => !state.askedFallbackIndices.includes(idx));
  const selectedPool = availableFallback.length >= c2 ? availableFallback : fallbackQ;
  
  const shuffled = [...selectedPool]
    .map((q, originalIdx) => ({ q, idx: fallbackQ.indexOf(q) }))
    .sort(() => Math.random() - 0.5);
    
  const chosen = shuffled.slice(0, c2);
  chosen.forEach(item => {
    state.askedFallbackIndices.push(item.idx);
  });
  
  return chosen.map(item => item.q);
}

async function fetchExplanation(question, answer, correctAnswer) {
  try {
    const res = await fetch('/api/explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, correctAnswer })
    });
    const data = await res.json();
    return data.explanation || 'Explanation not available.';
  } catch { return 'Explanation not available (offline).'; }
}

async function fetchRecommendation(score, role, difficulty) {
  try {
    const res = await fetch('/api/recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, role, difficulty })
    });
    const data = await res.json();
    return data.recommendation || offlineRec(score);
  } catch { return offlineRec(score); }
}

function offlineRec(s) {
  if (parseFloat(s) >= 80) return "Excellent! Strong AI fundamentals. Consider advanced specializations in deep learning or RL.";
  if (parseFloat(s) >= 50) return "Solid knowledge. Focus on a specialized area like Data Science or Computer Vision.";
  return "Foundational knowledge developing. Start with Data Analyst role and build skills progressively.";
}

// ================================================================
// QUIZ RENDERING — 2×2 Grid Options
// ================================================================
function renderQuestion() {
  const q = state.questions[state.index];
  if (!q) return;

  const isLocked = state.certMode && (state.answers[state.index] !== undefined);
  let qNumText = `Question ${state.certMode ? state.certTotalAnswered + state.index + 1 : state.index + 1}`;
  if (isLocked) {
    qNumText += state.answers[state.index] === null ? " — Skipped" : " — Answered";
  }
  $('questionNumber').textContent = qNumText;
  $('questionText').textContent = q.title || 'Question';

  const total = state.questions.length;
  $('quizCounter').textContent = state.certMode
    ? `Batch ${state.certBatchNum} · ${state.index + 1}/${total}`
    : `${state.index + 1}/${total}`;
  $('quizProgressBar').style.width = `${((state.index + 1) / total) * 100}%`;

  const grid = $('optionsList');
  grid.innerHTML = '';
  const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-tile';
    if (state.answers[state.index] === i) btn.classList.add('selected');
    if (isLocked) btn.disabled = true;
    btn.innerHTML = `
      <span class="option-key">${keys[i]}</span>
      <span class="option-text">${opt}</span>
    `;
    if (!isLocked) btn.addEventListener('click', () => selectAnswer(i));
    grid.appendChild(btn);
  });

  const expBox = $('explanationBox');
  if (state.answers[state.index] !== null && state.answers[state.index] !== undefined) {
    expBox.classList.remove('hidden');
    expBox.textContent = q.explanation || '⏳ Loading explanation...';
  } else {
    expBox.classList.add('hidden');
  }

  $('prevBtn').style.visibility = state.index === 0 ? 'hidden' : 'visible';
  $('nextBtn').textContent = state.index === total - 1
    ? (state.certMode ? 'Submit Batch ✓' : 'Finish ✓')
    : 'Next →';

  // Cert streak
  if (state.certMode) {
    $('certStreak').classList.remove('hidden');
    const answered = state.certTotalAnswered + state.answers.filter(a => a != null).length;
    const correct = state.certCorrect + state.answers.reduce((acc, a, i) => {
      const qq = state.questions[i];
      return acc + (qq && a === qq.correct ? 1 : 0);
    }, 0);
    const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    $('streakFill').style.width = `${pct}%`;
    $('streakText').textContent = `Accuracy: ${pct}%`;
    if (state.certTotalAnswered >= 50) {
      $('giveUpBtn')?.classList.remove('hidden');
    } else {
      $('giveUpBtn')?.classList.add('hidden');
    }
  } else {
    $('certStreak').classList.add('hidden');
    $('giveUpBtn')?.classList.add('hidden');
  }
}

async function selectAnswer(i) {
  if (state.certMode && state.answers[state.index] !== undefined) return;
  const q = state.questions[state.index];
  state.answers[state.index] = i;

  if (i === q.correct) AudioEngine.success();
  else AudioEngine.select();

  const expBox = $('explanationBox');
  expBox.classList.remove('hidden');
  if (q.explanation) {
    expBox.textContent = q.explanation;
  } else {
    expBox.textContent = '⏳ Loading explanation...';
    fetchExplanation(q.title, q.options[i], q.options[q.correct]).then(exp => {
      q.explanation = exp;
      if (state.questions[state.index] === q) {
        expBox.textContent = exp;
      }
    });
  }

  if (state.certMode) {
    renderQuestion();
  } else {
    document.querySelectorAll('.option-tile').forEach((btn, j) => btn.classList.toggle('selected', j === i));
  }
}

// ================================================================
// CERTIFICATION ADAPTIVE ALGORITHM
// ================================================================
function calcAdaptiveDifficulty() {
  const pct = state.certTotalAnswered > 0 ? (state.certCorrect / state.certTotalAnswered) * 100 : 50;
  if (pct >= 85) return 'advanced';
  if (pct >= 60) return 'intermediate';
  return 'beginner';
}

function shouldContinueCert() {
  const total = state.certTotalAnswered;
  const pct = total > 0 ? (state.certCorrect / total) * 100 : 0;
  if (total < state.certMinQuestions) return true;
  if (total >= 100) return false;
  if (pct >= 65 && pct <= 85 && total < 80) return true;
  if (pct > 85 && total < 70) return true;
  return false;
}

// ================================================================
// BEGIN QUIZ
// ================================================================
$('beginQuizBtn')?.addEventListener('click', async () => {
  AudioEngine.click();
  const emailVal = $('emailInput').value.trim();
  if (state.certMode) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      $('emailError').classList.remove('hidden');
      AudioEngine.warning();
      return;
    }
  }
  $('emailError').classList.add('hidden');
  state.name = $('nameInput').value.trim() || 'Candidate';
  state.email = emailVal;
  state.role = $('roleSelect').value;
  state.difficulty = $('difficultySelect').value;
  state.index = 0;
  state.answers = [];
  state.askedFallbackIndices = []; // Reset fallback tracking

  if (state.certMode) {
    state.certBatchNum = 1;
    state.certTotalAnswered = 0;
    state.certCorrect = 0;
    state.questionCount = state.certBatchSize;
  } else {
    state.questionCount = parseInt($('countSelect').value);
  }

  showSection('loading');
  $('loadingText').textContent = state.certMode
    ? `Generating certification questions for ${state.role}...`
    : `Generating ${state.questionCount} AI-powered questions for ${state.role}...`;

  state.questions = await fetchQuestions(state.certMode ? state.certBatchSize : state.questionCount);
  showSection('quiz');
  $('quizUserName').textContent = state.name;
  $('quizUserMeta').textContent = `${state.role} · ${state.difficulty}${state.certMode ? ' · Certification' : ''}`;
  startTimer();
  renderQuestion();
});

// ================================================================
// QUIZ NAVIGATION
// ================================================================
$('nextBtn')?.addEventListener('click', () => {
  AudioEngine.click();
  if (state.index < state.questions.length - 1) {
    state.index++;
    renderQuestion();
  } else {
    if (state.certMode) finishCertBatch();
    else showResults();
  }
});

$('prevBtn')?.addEventListener('click', () => {
  AudioEngine.click();
  if (state.index > 0) {
    state.index--;
    renderQuestion();
  }
});

$('skipBtn')?.addEventListener('click', () => {
  AudioEngine.warning();
  state.answers[state.index] = null;
  if (state.index < state.questions.length - 1) {
    state.index++;
    renderQuestion();
  } else {
    if (state.certMode) finishCertBatch();
    else showResults();
  }
});

// ================================================================
// CERTIFICATION BATCH COMPLETION
// ================================================================
async function finishCertBatch() {
  const batchCorrect = state.answers.reduce((acc, a, i) => {
    const q = state.questions[i];
    return acc + (q && a === q.correct ? 1 : 0);
  }, 0);
  state.certCorrect += batchCorrect;
  state.certTotalAnswered += state.questions.length;

  if (shouldContinueCert()) {
    state.certBatchNum++;
    const adaptDiff = calcAdaptiveDifficulty();
    showSection('loading');
    $('loadingText').textContent = `Batch ${state.certBatchNum}: Generating ${adaptDiff} questions... (${state.certTotalAnswered} answered so far)`;
    const newQ = await fetchQuestions(state.certBatchSize, adaptDiff);
    state.questions = newQ;
    state.index = 0;
    state.answers = [];
    showSection('quiz');
    renderQuestion();
  } else {
    showCertResults();
  }
}

// ================================================================
// SVG SCORE RING ANIMATION
// ================================================================
function animateScoreRing(pct) {
  const ringFill = $('scoreRingFill');
  const ringValue = $('scoreRingValue');
  if (!ringFill || !ringValue) return;

  const circumference = 2 * Math.PI * 38;
  const target = (pct / 100) * circumference;

  if (pct >= 80) ringFill.style.stroke = 'var(--success)';
  else if (pct >= 60) ringFill.style.stroke = 'var(--accent)';
  else if (pct >= 40) ringFill.style.stroke = 'var(--warning)';
  else ringFill.style.stroke = 'var(--error)';

  ringFill.style.strokeDasharray = `0 ${circumference}`;
  ringValue.textContent = '0%';

  requestAnimationFrame(() => {
    setTimeout(() => {
      ringFill.style.strokeDasharray = `${target} ${circumference}`;

      let current = 0;
      const step = Math.max(1, Math.ceil(pct / 40));
      const interval = setInterval(() => {
        current += step;
        if (current >= pct) {
          current = pct;
          clearInterval(interval);
        }
        ringValue.textContent = `${current}%`;
      }, 25);
    }, 200);
  });
}

// ================================================================
// RESULTS DISPLAY
// ================================================================
function showCertResults() {
  stopTimer();
  const elapsed = Date.now() - state.startTime;
  const pct = Math.round((state.certCorrect / state.certTotalAnswered) * 100);
  const passed = pct >= 70;

  showSection('results');
  if (passed) AudioEngine.chime();
  else AudioEngine.warning();

  $('resultsTitle').textContent = passed ? '◆ Certification Passed!' : '◇ Assessment Complete';
  $('resultSummaryText').textContent = `${state.name} completed ${state.certTotalAnswered} questions as ${state.role}`;
  $('scoreValue').textContent = `${state.certCorrect}/${state.certTotalAnswered}`;
  $('timeValue').textContent = formatTime(elapsed);
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : 'C';
  $('gradeValue').textContent = grade;

  animateScoreRing(pct);

  const cr = $('certResult');
  cr.classList.remove('hidden', 'passed', 'failed');
  cr.classList.add(passed ? 'passed' : 'failed');
  $('certResultIcon').textContent = passed ? '◆' : '◇';
  $('certResultText').textContent = passed ? 'Certification Passed!' : 'Certification Not Passed';
  $('certResultSub').textContent = passed
    ? `You scored ${pct}% across ${state.certTotalAnswered} adaptive questions`
    : `You needed 70% but scored ${pct}%. Keep practicing!`;

  if (passed) {
    $('certificateBtn').classList.remove('hidden');
    // Generate and send email automatically!
    try {
      const { doc, certId } = generateCertificatePDF(false);
      const dataUri = doc.output('datauristring');
      const pdfBase64 = dataUri.substring(dataUri.indexOf(',') + 1);
      sendCertificateEmail(certId, pdfBase64);
    } catch (err) {
      console.error("Failed to generate/send certificate:", err);
    }
  } else {
    $('certificateBtn').classList.add('hidden');
    $('emailStatus').classList.add('hidden');
  }

  $('recommendationText').textContent = 'Analyzing...';
  fetchRecommendation(`${state.certCorrect}/${state.certTotalAnswered} (${pct}%)`, state.role, state.difficulty)
    .then(r => $('recommendationText').textContent = r);

  $('answersListContainer').innerHTML = '<p style="color:var(--text-secondary);font-size:0.9rem;">Certification mode: detailed review covers the final batch of questions.</p>';

  // Load deep analysis
  loadDeepAnalysis(state.certCorrect, state.certTotalAnswered, pct, grade, elapsed, 'Certification');
}

async function showResults() {
  stopTimer();
  const elapsed = Date.now() - state.startTime;
  const correct = state.answers.reduce((acc, a, i) => {
    const q = state.questions[i];
    return acc + (q && a === q.correct ? 1 : 0);
  }, 0);
  const total = state.questions.length;
  const pct = Math.round((correct / total) * 100);

  showSection('results');
  if (pct >= 70) AudioEngine.success();

  $('resultsTitle').textContent = '→ Assessment Complete!';
  $('resultSummaryText').textContent = `${state.name} completed ${total} questions as ${state.role} (${state.difficulty})`;
  $('scoreValue').textContent = `${correct}/${total}`;
  $('timeValue').textContent = formatTime(elapsed);
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : 'C';
  $('gradeValue').textContent = grade;

  animateScoreRing(pct);

  $('certificateBtn').classList.add('hidden');
  $('certResult').classList.add('hidden');
  $('emailStatus').classList.add('hidden'); // Hide email delivery status in practice mode

  $('recommendationText').textContent = 'Analyzing...';
  const rec = await fetchRecommendation(`${correct}/${total} (${pct}%)`, state.role, state.difficulty);
  $('recommendationText').textContent = rec;

  const container = $('answersListContainer');
  container.innerHTML = '';
  state.questions.forEach((q, i) => {
    const uAns = Number.isInteger(state.answers[i]) ? q.options[state.answers[i]] : 'Skipped';
    const cAns = q.correct >= 0 ? q.options[q.correct] : '—';
    const ok = state.answers[i] === q.correct;
    const skip = state.answers[i] == null;
    const item = document.createElement('div');
    item.className = 'answer-item';
    item.innerHTML = `<div class="aq">${i + 1}. ${q.title}</div>
<div class="aa ${skip ? '' : ok ? 'correct-ans' : 'wrong-ans'}">Your answer: ${uAns} ${ok ? '✓' : skip ? '—' : '✗'}</div>
<div class="aa correct-ans">Correct: ${cAns}</div>
${q.explanation ? `<div class="ae">→ ${q.explanation}</div>` : ''}`;
    container.appendChild(item);
  });

  // Load deep analysis
  loadDeepAnalysis(correct, total, pct, grade, elapsed, 'Practice');
}

// ================================================================
// CERTIFICATE GENERATION HELPER
// ================================================================
function generateCertificatePDF(isAutoDownload = true) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape');
  const W = 297, H = 210, CX = W / 2;
  const pct = Math.round((state.certCorrect / state.certTotalAnswered) * 100);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = `AICP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Deep navy background
  doc.setFillColor(8, 12, 28);
  doc.rect(0, 0, W, H, 'F');

  // Subtle gradient overlay (simulated)
  doc.setFillColor(12, 18, 40);
  doc.rect(0, 0, W, H / 2, 'F');

  // Thin gold double-border system
  doc.setDrawColor(180, 155, 70);
  doc.setLineWidth(1.0);
  doc.rect(10, 10, W - 20, H - 20);
  
  doc.setDrawColor(140, 120, 55);
  doc.setLineWidth(0.3);
  doc.rect(13, 13, W - 26, H - 26);

  // Corner accents
  const co = 15, cl = 16;
  doc.setDrawColor(180, 155, 70);
  doc.setLineWidth(0.6);
  [[co, co, 1, 1], [W - co, co, -1, 1], [co, H - co, 1, -1], [W - co, H - co, -1, -1]].forEach(([x, y, dx, dy]) => {
    doc.line(x, y, x + cl * dx, y);
    doc.line(x, y, x, y + cl * dy);
  });

  // Top decorative elements
  doc.setDrawColor(180, 155, 70);
  doc.setLineWidth(0.3);
  doc.line(60, 26, CX - 30, 26);
  doc.line(CX + 30, 26, W - 60, 26);
  doc.setFillColor(180, 155, 70);
  doc.circle(CX, 26, 1.2, 'F');

  // Header text (spaced manually for elegant look)
  doc.setTextColor(180, 155, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('A I   C A R E E R   P A T H', CX, 35, { align: 'center' });

  // Subtitle
  doc.setFontSize(6.5);
  doc.setTextColor(120, 105, 50);
  doc.text('—  P R O F E S S I O N A L   C E R T I F I C A T I O N  —', CX, 41, { align: 'center' });

  // Main title
  doc.setTextColor(240, 235, 215);
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.text('Certificate of Excellence', CX, 58, { align: 'center' });

  // Gold divider
  doc.setDrawColor(180, 155, 70);
  doc.setLineWidth(0.3);
  doc.line(90, 64, CX - 6, 64);
  doc.line(CX + 6, 64, W - 90, 64);

  // Certify text
  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(150, 140, 110);
  doc.text('This official certificate is proudly presented to', CX, 76, { align: 'center' });

  // Name
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(26);
  doc.setTextColor(210, 185, 90);
  doc.text(state.name, CX, 92, { align: 'center' });

  // Elegant divider under name
  doc.setDrawColor(180, 155, 70);
  doc.setLineWidth(0.2);
  doc.line(CX - 40, 97, CX + 40, 97);

  // Achievement Description
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(170, 160, 140);
  doc.text('for demonstrating exceptional knowledge and subject matter expertise in', CX, 107, { align: 'center' });

  // Role
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(240, 235, 215);
  doc.text(`${state.role} Specialization`, CX, 119, { align: 'center' });

  // Score Detail
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(150, 140, 110);
  doc.text(`Completed the adaptive certification syllabus with a score of ${state.certCorrect}/${state.certTotalAnswered} (${pct}%)`, CX, 129, { align: 'center' });

  // Date
  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(130, 120, 90);
  doc.text(`Issued on ${dateStr}`, CX, 139, { align: 'center' });

  // Signatures & Seal block setup
  const sy = 168;

  // Signature Lines
  doc.setDrawColor(130, 115, 65);
  doc.setLineWidth(0.25);
  doc.line(45, sy, 105, sy);       // Left signature line
  doc.line(192, sy, 252, sy);     // Right signature line

  // Signature Text Labels
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 120, 90);
  doc.text('Assessment Director', 75, sy + 5, { align: 'center' });
  doc.setFont('times', 'italic');
  doc.text('AI Career Path Board', 75, sy + 9, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.text('Verification Authority', 222, sy + 5, { align: 'center' });
  doc.setFont('times', 'italic');
  doc.text('AI Career Path Pro', 222, sy + 9, { align: 'center' });

  // Medallion Gold Seal
  const hiddenLogo = $('hiddenLogoImg');
  if (hiddenLogo && hiddenLogo.src && hiddenLogo.src !== "") {
    // Draw double gold seal circles
    doc.setDrawColor(180, 155, 70);
    doc.setLineWidth(0.4);
    doc.circle(CX, sy - 2, 13, 'D'); // Outer seal
    doc.setLineWidth(0.15);
    doc.circle(CX, sy - 2, 11.5, 'D'); // Inner seal
    
    try {
      doc.addImage(hiddenLogo, 'PNG', CX - 9, sy - 11, 18, 18);
    } catch (e) {
      console.warn("Failed to embed logo to PDF, falling back to vector seal:", e);
      drawFallbackSeal(doc, CX, sy);
    }
  } else {
    drawFallbackSeal(doc, CX, sy);
  }

  // Footer Metadata details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(90, 85, 65);
  doc.text(`Certificate ID: ${certId}`, 25, H - 12, { align: 'left' });
  doc.text('Powered by Google Gemini AI', CX, H - 12, { align: 'center' });
  doc.text('Verify authenticity at: https://ai-career-path-pro.onrender.com/', W - 25, H - 12, { align: 'right' });

  if (isAutoDownload) {
    doc.save(`${state.name.replace(/\s+/g, '_')}_AI_Career_Certificate.pdf`);
  }
  return { doc, certId, pct };
}

// Fallback Seal Drawing Helper (Gold Theme Medallion)
function drawFallbackSeal(doc, CX, sy) {
  doc.setFillColor(140, 120, 55); // Dark gold
  doc.circle(CX, sy - 2, 12, 'F');
  doc.setFillColor(170, 145, 65); // Medium gold
  doc.circle(CX, sy - 2, 9, 'F');
  doc.setFillColor(210, 185, 90); // Light gold
  doc.circle(CX, sy - 2, 6, 'F');
  
  doc.setTextColor(8, 12, 28); // Deep Navy text for contrast
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.text('VERIFIED', CX, sy - 4, { align: 'center' });
  doc.setFontSize(3.2);
  doc.text('AI CAREER', CX, sy - 1.2, { align: 'center' });
  doc.text('PATH', CX, sy + 1.2, { align: 'center' });
}

// ================================================================
// SEND CERTIFICATE EMAIL HELPER
// ================================================================
async function sendCertificateEmail(certId, pdfBase64) {
  const statusEl = $('emailStatus');
  const statusText = $('emailStatusText');
  const statusIcon = $('emailStatusIcon');

  if (!statusEl || !statusText) return;

  statusEl.classList.remove('hidden', 'success', 'error');
  statusEl.classList.add('loading');
  statusIcon.textContent = '📧';
  statusText.textContent = `Sending certificate to ${state.email}...`;

  try {
    const pct = Math.round((state.certCorrect / state.certTotalAnswered) * 100);
    const res = await fetch('/api/send-certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: state.email,
        name: state.name,
        role: state.role,
        score: state.certCorrect,
        totalQuestions: state.certTotalAnswered,
        percentage: pct,
        certId: certId,
        pdfBase64: pdfBase64
      })
    });
    const data = await res.json();
    if (data.success) {
      statusEl.classList.remove('loading');
      statusEl.classList.add('success');
      statusIcon.textContent = '✓';
      statusText.textContent = `Certificate sent successfully to ${state.email}!`;
    } else {
      statusEl.classList.remove('loading');
      statusEl.classList.add('error');
      statusIcon.textContent = '✗';
      statusText.textContent = data.message || `Failed to send email.`;
    }
  } catch (e) {
    statusEl.classList.remove('loading');
    statusEl.classList.add('error');
    statusIcon.textContent = '✗';
    statusText.textContent = `Error sending email: ${e.message}`;
  }
}

// ================================================================
// DEEP PERFORMANCE ANALYSIS HELPER
// ================================================================
async function loadDeepAnalysis(score, total, pct, grade, elapsed, mode) {
  const daSection = $('deepAnalysis');
  const daLoading = $('deepAnalysisLoading');
  const daContent = $('deepAnalysisContent');

  if (!daSection || !daLoading || !daContent) return;

  daSection.classList.remove('hidden');
  daLoading.classList.remove('hidden');
  daContent.classList.add('hidden');

  try {
    const res = await fetch('/api/deep-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: state.name,
        role: state.role,
        difficulty: state.difficulty,
        score,
        totalQuestions: total,
        percentage: pct,
        grade,
        timeTaken: formatTime(elapsed),
        mode
      })
    });
    const data = await res.json();
    if (data.analysis) {
      const a = data.analysis;

      // Populate verdict
      $('analysisVerdict').textContent = a.overallVerdict || '';

      // Populate strengths
      const strengthsUl = $('analysisStrengths');
      strengthsUl.innerHTML = '';
      (a.strengths || []).forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        strengthsUl.appendChild(li);
      });

      // Populate areas to improve
      const improveUl = $('analysisImprove');
      improveUl.innerHTML = '';
      (a.areasToImprove || []).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        improveUl.appendChild(li);
      });

      // Populate resources
      const resourcesList = $('analysisResources');
      resourcesList.innerHTML = '';
      (a.recommendedResources || []).forEach(r => {
        const div = document.createElement('div');
        div.className = 'resource-item';
        div.innerHTML = `
          <span class="resource-type">${r.type || 'Resource'}</span>
          <div class="resource-title">${r.title}</div>
          <div class="resource-reason">${r.reason}</div>
        `;
        resourcesList.appendChild(div);
      });

      // Populate career readiness
      $('readinessLevel').textContent = a.careerReadiness?.level || '—';
      $('readinessDesc').textContent = a.careerReadiness?.description || '';

      // Populate market insights
      $('salaryRange').textContent = a.estimatedSalaryRange || '—';
      $('timeToReady').textContent = a.timeToJobReady || '—';

      // Populate next steps
      const nextStepsOl = $('analysisNextSteps');
      nextStepsOl.innerHTML = '';
      (a.nextSteps || []).forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        nextStepsOl.appendChild(li);
      });

      daLoading.classList.add('hidden');
      daContent.classList.remove('hidden');
    } else {
      daLoading.innerHTML = '<span style="color:var(--error);">✗ Failed to generate deep analysis. Please retake or refresh.</span>';
    }
  } catch (e) {
    console.error(e);
    daLoading.innerHTML = `<span style="color:var(--error);">✗ Error loading deep analysis: ${e.message}</span>`;
  }
}

$('restartBtn')?.addEventListener('click', () => {
  AudioEngine.click();
  state.questions = [];
  state.index = 0;
  state.answers = [];
  state.startTime = null;
  state.certMode = false;
  showSection('hero');
});

// ================================================================
// REPORT DOWNLOAD
// ================================================================
$('downloadReportBtn')?.addEventListener('click', () => {
  AudioEngine.click();
  const correct = state.certMode
    ? state.certCorrect
    : state.answers.reduce((a, ans, i) => {
      const q = state.questions[i];
      return a + (q && ans === q.correct ? 1 : 0);
    }, 0);
  const total = state.certMode ? state.certTotalAnswered : state.questions.length;
  let r = `AI CAREER PATH — ASSESSMENT REPORT\n${'='.repeat(40)}\nName: ${state.name}\nRole: ${state.role}\nDifficulty: ${state.difficulty}\nMode: ${state.certMode ? 'Certification' : 'Practice'}\nScore: ${correct}/${total}\nDate: ${new Date().toLocaleDateString()}\n`;
  const blob = new Blob([r], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.name.replace(/\s+/g, '_')}_Report.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

// ================================================================
// PREMIUM CERTIFICATE — Modern Minimal Design
// ================================================================
$('certificateBtn')?.addEventListener('click', () => {
  AudioEngine.chime();
  generateCertificatePDF(true);
});

// ================================================================
// INITIAL SECTION DISPLAY
// ================================================================
showSection('hero');

// ================================================================
// SPLASH SCREEN DISMISSAL
// ================================================================
(function () {
  const intro = $('intro-screen');
  if (intro) {
    setTimeout(() => {
      intro.classList.add('fade-out');
      setTimeout(() => {
        intro.remove();
      }, 800);
    }, 2600);
  }
})();

// ================================================================
// ADMIN PORTAL SYSTEM
// ================================================================
(function () {
  const openBtn = $('adminPortalOpenBtn');
  const loginOverlay = $('adminLoginOverlay');
  const loginSubmitBtn = $('adminLoginSubmitBtn');
  const loginCancelBtn = $('adminLoginCancelBtn');
  const usernameInput = $('adminUsernameInput');
  const passwordInput = $('adminPasswordInput');
  const loginError = $('adminLoginError');
  const exitBtn = $('adminExitBtn');

  if (!openBtn) return;

  // Open login dialog from settings
  openBtn.addEventListener('click', () => {
    $('settingsOverlay').classList.remove('active'); // Close settings panel
    usernameInput.value = '';
    passwordInput.value = '';
    loginError.classList.add('hidden');
    loginOverlay.classList.add('active');
    AudioEngine.click();
  });

  // Cancel login
  loginCancelBtn.addEventListener('click', () => {
    loginOverlay.classList.remove('active');
    AudioEngine.click();
  });

  let currentAdminUser = "";
  let currentAdminPass = "";

  // Submit login
  loginSubmitBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    AudioEngine.click();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        currentAdminUser = username;
        currentAdminPass = password;
        loginOverlay.classList.remove('active');
        showSection('admin');
      } else {
        loginError.classList.remove('hidden');
        AudioEngine.warning();
      }
    } catch (e) {
      console.error(e);
      loginError.textContent = '✗ API Connection error';
      loginError.classList.remove('hidden');
      AudioEngine.warning();
    }
  });

  // Exit Admin Section
  exitBtn.addEventListener('click', () => {
    AudioEngine.click();
    showSection('hero');
  });

  // 1. Email Service Test
  $('adminSendTestEmailBtn')?.addEventListener('click', async () => {
    const email = $('adminTestEmailInput').value.trim();
    const statusEl = $('adminEmailStatus');
    if (!email) {
      statusEl.classList.remove('hidden');
      statusEl.className = 'form-hint error';
      statusEl.textContent = '✗ Please enter a recipient email';
      AudioEngine.warning();
      return;
    }

    AudioEngine.click();
    statusEl.classList.remove('hidden');
    statusEl.className = 'form-hint';
    statusEl.textContent = '⚡ Sending test email...';

    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        statusEl.className = 'form-hint success';
        statusEl.style.color = 'var(--success)';
        statusEl.textContent = `✓ ${data.message}`;
      } else {
        statusEl.className = 'form-hint error';
        statusEl.style.color = 'var(--error)';
        statusEl.textContent = `✗ ${data.message}`;
      }
    } catch (e) {
      statusEl.className = 'form-hint error';
      statusEl.style.color = 'var(--error)';
      statusEl.textContent = `✗ Network error: ${e.message}`;
    }
  });

  // 2. Certificate PDF Test
  $('adminTestCertBtn')?.addEventListener('click', () => {
    AudioEngine.click();
    // Cache original state to avoid clobbering candidate results
    const prevName = state.name;
    const prevRole = state.role;
    const prevCorrect = state.certCorrect;
    const prevTotal = state.certTotalAnswered;

    state.name = "John Admin Doe";
    state.role = "ML Engineer (Test Certificate)";
    state.certCorrect = 45;
    state.certTotalAnswered = 50;

    try {
      generateCertificatePDF(true);
    } catch (err) {
      alert("Certificate generation failed: " + err.message);
    }

    // Restore original state
    state.name = prevName;
    state.role = prevRole;
    state.certCorrect = prevCorrect;
    state.certTotalAnswered = prevTotal;
  });

  // 3. Deep Analysis Test
  $('adminTestAnalysisBtn')?.addEventListener('click', async () => {
    AudioEngine.click();
    const loadingEl = $('adminAnalysisLoading');
    const resultEl = $('adminAnalysisResult');

    loadingEl.classList.remove('hidden');
    resultEl.classList.add('hidden');

    try {
      const res = await fetch('/api/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Test User",
          role: "ML Engineer",
          difficulty: "intermediate",
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          grade: "A",
          timeTaken: "02:15",
          mode: "Practice"
        })
      });
      const data = await res.json();
      loadingEl.classList.add('hidden');
      resultEl.classList.remove('hidden');
      if (data.analysis) {
        resultEl.textContent = JSON.stringify(data.analysis, null, 2);
      } else {
        resultEl.textContent = "Error: Gemini returned invalid analysis.";
      }
    } catch (e) {
      loadingEl.classList.add('hidden');
      resultEl.classList.remove('hidden');
      resultEl.textContent = "Network error: " + e.message;
    }
  });

  // 4. Complete Suite Test (Test Everything)
  $('adminRunSuiteBtn')?.addEventListener('click', async () => {
    const email = $('adminSuiteEmailInput').value.trim();
    const suiteRes = $('adminSuiteResult');
    if (!email) {
      suiteRes.classList.remove('hidden');
      suiteRes.innerHTML = '<span style="color:var(--error);">✗ Recipient email address required.</span>';
      AudioEngine.warning();
      return;
    }

    AudioEngine.click();
    suiteRes.classList.remove('hidden');
    suiteRes.innerHTML = '🔄 Starting complete test suite...<br>';

    try {
      // Step 1: Call Gemini Deep Analysis
      suiteRes.innerHTML += '🧬 <strong>Step 1/3</strong>: Testing Gemini AI Deep Analysis...<br>';
      const analysisRes = await fetch('/api/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Admin Tester",
          role: "AI Researcher",
          difficulty: "advanced",
          score: 48,
          totalQuestions: 50,
          percentage: 96,
          grade: "A+",
          timeTaken: "12:30",
          mode: "Certification"
        })
      });
      const analysisData = await analysisRes.json();
      if (!analysisData.analysis) {
        throw new Error("Gemini AI Deep Analysis check failed.");
      }
      suiteRes.innerHTML += '✔️ Gemini Deep Analysis test passed.<br>';

      // Step 2: Build certificate PDF
      suiteRes.innerHTML += '📄 <strong>Step 2/3</strong>: Building Certificate PDF...<br>';
      const prevName = state.name;
      const prevRole = state.role;
      const prevCorrect = state.certCorrect;
      const prevTotal = state.certTotalAnswered;

      state.name = "Admin Suite Tester";
      state.role = "AI Researcher";
      state.certCorrect = 48;
      state.certTotalAnswered = 50;

      const { doc, certId } = generateCertificatePDF(false);
      const dataUri = doc.output('datauristring');
      const pdfBase64 = dataUri.substring(dataUri.indexOf(',') + 1);

      state.name = prevName;
      state.role = prevRole;
      state.certCorrect = prevCorrect;
      state.certTotalAnswered = prevTotal;
      suiteRes.innerHTML += '✔️ Certificate generated successfully.<br>';

      // Step 3: Send via API
      suiteRes.innerHTML += '📧 <strong>Step 3/3</strong>: Sending PDF via SMTP...<br>';
      const sendRes = await fetch('/api/send-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: "Admin Suite Tester",
          role: "AI Researcher",
          score: 48,
          totalQuestions: 50,
          percentage: 96,
          certId: certId,
          pdfBase64: pdfBase64
        })
      });
      const sendData = await sendRes.json();
      if (sendData.success) {
        suiteRes.innerHTML += `<span style="color:var(--success);">✔️ Success! Suite finished. Email sent successfully to ${email}.</span>`;
      } else {
        throw new Error(sendData.message || "Failed to dispatch email.");
      }
    } catch (err) {
      suiteRes.innerHTML += `<span style="color:var(--error);">❌ Suite failed: ${err.message}</span>`;
      AudioEngine.warning();
    }
  });

  // 5. Branding Asset Manager
  const logoInput = $('adminLogoUpload');
  const logoBtn = $('adminLogoUploadBtn');
  const logoStatus = $('adminLogoUploadStatus');

  const faviconInput = $('adminFaviconUpload');
  const faviconBtn = $('adminFaviconUploadBtn');
  const faviconStatus = $('adminFaviconUploadStatus');

  let logoBase64 = null;
  let faviconBase64 = null;

  if (logoInput && logoBtn) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        logoStatus.textContent = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;
        logoBtn.disabled = false;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          logoBase64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
        };
        reader.readAsDataURL(file);
      } else {
        logoStatus.textContent = 'No file chosen';
        logoBtn.disabled = true;
        logoBase64 = null;
      }
    });

    logoBtn.addEventListener('click', async () => {
      if (!logoBase64) return;
      logoBtn.disabled = true;
      logoStatus.textContent = '⏳ Uploading logo...';
      AudioEngine.click();

      try {
        const username = currentAdminUser || 'abhi';
        const password = currentAdminPass || 'qwertyuiop';

        const res = await fetch('/api/admin/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            filename: 'logo.png',
            base64Data: logoBase64
          })
        });
        const data = await res.json();
        if (data.success) {
          logoStatus.textContent = '✓ Logo updated successfully! Reloading...';
          logoStatus.style.color = 'var(--success)';
          AudioEngine.success();
          setTimeout(() => location.reload(), 1500);
        } else {
          logoStatus.textContent = `✗ Error: ${data.message}`;
          logoStatus.style.color = 'var(--error)';
          logoBtn.disabled = false;
          AudioEngine.warning();
        }
      } catch (err) {
        logoStatus.textContent = `✗ Upload failed: ${err.message}`;
        logoStatus.style.color = 'var(--error)';
        logoBtn.disabled = false;
        AudioEngine.warning();
      }
    });
  }

  if (faviconInput && faviconBtn) {
    faviconInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        faviconStatus.textContent = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;
        faviconBtn.disabled = false;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          faviconBase64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
        };
        reader.readAsDataURL(file);
      } else {
        faviconStatus.textContent = 'No file chosen';
        faviconBtn.disabled = true;
        faviconBase64 = null;
      }
    });

    faviconBtn.addEventListener('click', async () => {
      if (!faviconBase64) return;
      faviconBtn.disabled = true;
      faviconStatus.textContent = '⏳ Uploading favicon...';
      AudioEngine.click();

      try {
        const username = currentAdminUser || 'abhi';
        const password = currentAdminPass || 'qwertyuiop';

        const res = await fetch('/api/admin/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            filename: 'favicon.png',
            base64Data: faviconBase64
          })
        });
        const data = await res.json();
        if (data.success) {
          faviconStatus.textContent = '✓ Favicon updated successfully! Reloading...';
          faviconStatus.style.color = 'var(--success)';
          AudioEngine.success();
          setTimeout(() => location.reload(), 1500);
        } else {
          faviconStatus.textContent = `✗ Error: ${data.message}`;
          faviconStatus.style.color = 'var(--error)';
          faviconBtn.disabled = false;
          AudioEngine.warning();
        }
      } catch (err) {
        faviconStatus.textContent = `✗ Upload failed: ${err.message}`;
        faviconStatus.style.color = 'var(--error)';
        faviconBtn.disabled = false;
        AudioEngine.warning();
      }
    });
  }
})();