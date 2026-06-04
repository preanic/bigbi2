const slides = document.querySelectorAll('.slide');
const dotsContainer = document.querySelector('.dots');

let current = 0;

slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');

    if (i === 0) {
        dot.classList.add('active');
    }

    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function showSlide(index) {

    slides[current].classList.remove('active');
    dots[current].classList.remove('active');

    current = index;

    slides[current].classList.add('active');
    dots[current].classList.add('active');
}

setInterval(() => {
    let next = current + 1;

    if (next >= slides.length) {
        next = 0;
    }

    showSlide(next);
}, 5000);
