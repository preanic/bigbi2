document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsContainer = document.querySelector('.dots');

  // Одинаковые значения должны стоять на всех трёх экранах.
  const SLIDE_DURATION = 9500;
  const FADE_DURATION = 1000;

  // Общая фиксированная точка отсчёта.
  // Месяцы в Date.UTC считаются от 0: 0 — январь.
  const SYNC_START = Date.UTC(2026, 0, 1, 0, 0, 0);

  let current = -1;
  let synchronizationTimer = null;
  let fadeTimer = null;

  if (slides.length === 0) {
    console.error('Не найдены элементы с классом .slide');
    return;
  }

  /*
   * Подстановка изображения «сэндвича дня».
  */
  const sandwichDayImage = document.querySelector('#sandwichDayImage');
  const sandwichId = localStorage.getItem('sandwichOfTheDay') || '1';

  if (sandwichDayImage) {
    sandwichDayImage.src = `screens/2/bigbi_day/${sandwichId}.png`;
  }

  /*
   * Создание точек.
   */
  if (dotsContainer) {
    dotsContainer.replaceChildren();

    slides.forEach(() => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer
    ? Array.from(dotsContainer.querySelectorAll('.dot'))
    : [];

  /*
   * Предзагрузка изображений.
   */
  slides.forEach((slide) => {
    if (slide instanceof HTMLImageElement) {
      const image = new Image();
      image.src = slide.currentSrc || slide.src;
    }

    slide.classList.remove('active');
    slide.style.zIndex = '1';
  });

  function getElapsedTime() {
    return Date.now() - SYNC_START;
  }

  /*
   * Номер общего временного шага.
   * Он одинаков на всех экранах.
   */
  function getGlobalStep() {
    return Math.floor(getElapsedTime() / SLIDE_DURATION);
  }

  /*
   * На каждом экране свой индекс слайда,
   * поскольку количество слайдов может отличаться.
   */
  function getCurrentSlideIndex() {
    const step = getGlobalStep();

    return ((step % slides.length) + slides.length) % slides.length;
  }

  function updateDots(index) {
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  /*
   * Первичная установка слайда без анимации.
   */
  function showInitialSlide(index) {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
      slide.style.zIndex = slideIndex === index ? '2' : '1';
    });

    updateDots(index);
    current = index;
  }

  /*
   * Плавный переход.
   * Новый слайд располагается поверх предыдущего.
   */
  function showSlide(nextIndex) {
    if (nextIndex === current) {
      updateDots(nextIndex);
      return;
    }

    clearTimeout(fadeTimer);

    const previousIndex = current;
    const nextSlide = slides[nextIndex];

    nextSlide.style.zIndex = '3';
    nextSlide.classList.add('active');

    // Точка меняется в момент начала появления нового слайда.
    updateDots(nextIndex);

    // Сразу сохраняем новый индекс, чтобы не возникал дрейф.
    current = nextIndex;

    if (previousIndex < 0) {
      nextSlide.style.zIndex = '2';
      return;
    }

    const previousSlide = slides[previousIndex];
    previousSlide.style.zIndex = '2';

    fadeTimer = setTimeout(() => {
      previousSlide.classList.remove('active');
      previousSlide.style.zIndex = '1';

      nextSlide.style.zIndex = '2';
    }, FADE_DURATION);
  }

  /*
   * Вычисляет, сколько осталось до ближайшей
   * общей границы переключения.
   */
  function getTimeUntilNextSlide() {
    const elapsed = getElapsedTime();

    const positionInStep =
      ((elapsed % SLIDE_DURATION) + SLIDE_DURATION) % SLIDE_DURATION;

    return SLIDE_DURATION - positionInStep;
  }

  /*
   * При каждом переключении время вычисляется заново.
   * Поэтому задержки таймера не накапливаются.
   */
  function synchronize() {
    clearTimeout(synchronizationTimer);

    const correctIndex = getCurrentSlideIndex();

    if (current === -1) {
      showInitialSlide(correctIndex);
    } else {
      showSlide(correctIndex);
    }

    synchronizationTimer = setTimeout(() => {
      const nextCorrectIndex = getCurrentSlideIndex();
      showSlide(nextCorrectIndex);
      synchronize();
    }, getTimeUntilNextSlide());
  }

  synchronize();

  /*
   * Повторная синхронизация после сна,
   * сворачивания вкладки или возвращения фокуса.
   */
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      synchronize();
    }
  });

  window.addEventListener('focus', synchronize);

  window.addEventListener('pageshow', synchronize);
});
