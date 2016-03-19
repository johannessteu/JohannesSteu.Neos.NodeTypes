function initializeSlider() {
    $('.slideshow').slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        adaptiveHeight: true
    });
}

$(document).ready(function () {
    initializeSlider();
});

if (typeof document.addEventListener === 'function') {
    document.addEventListener('Neos.PageLoaded', function(event) {
        initializeSlider();
    }, false);
}


if (typeof document.addEventListener === 'function') {
    document.addEventListener('Neos.ContentModuleLoaded', function(event) {
        initializeSlider();
    }, false);
}

