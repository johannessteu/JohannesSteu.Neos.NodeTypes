/*!
 * jQuery Accordion 0.0.1
 * (c) 2014 Victor Fernandez <victor@vctrfrnndz.com>
 * MIT Licensed.
 */

;(function ( $, window, document, undefined ) {

    var pluginName = 'accordeon',
        defaults = {
            transitionSpeed: 300,
            transitionEasing: 'ease',
            controlElement: '[data-control]',
            contentElement: '[data-content]',
            groupElement: '[data-accordeon-group]',
            singleOpen: true
        };

    function Accordion(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Accordion.prototype.init = function () {
        var self = this,
            opts = self.options;

        var $accordeon = $(self.element),
            $controls = $accordeon.find('> ' + opts.controlElement),
            $content =  $accordeon.find('> ' + opts.contentElement);

        var accordeonParentsQty = $accordeon.parents('[data-accordeon]').length,
            accordeonHasParent = accordeonParentsQty > 0;

        var closedCSS = { 'max-height': 0, 'overflow': 'hidden' };

        var CSStransitions = supportsTransitions();

        function debounce(func, threshold, execAsap) {
            var timeout;

            return function debounced() {
                var obj = this,
                    args = arguments;

                function delayed() {
                    if (!execAsap) func.apply(obj, args);
                    timeout = null;
                };

                if (timeout) clearTimeout(timeout);
                else if (execAsap) func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 100);
            };
        }

        function supportsTransitions() {
            var b = document.body || document.documentElement,
                s = b.style,
                p = 'transition';

            if (typeof s[p] == 'string') {
                return true;
            }

            var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];

            p = 'Transition';

            for (var i=0; i<v.length; i++) {
                if (typeof s[v[i] + p] == 'string') {
                    return true;
                }
            }

            return false;
        }

        function requestAnimFrame(cb) {
            if(window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame) {
                return  requestAnimationFrame(cb) ||
                    webkitRequestAnimationFrame(cb) ||
                    mozRequestAnimationFrame(cb);
            } else {
                return setTimeout(cb, 1000 / 60);
            }
        }

        function toggleTransition($el, remove) {
            if(!remove) {
                $content.css({
                    '-webkit-transition': 'max-height ' + opts.transitionSpeed + 'ms ' + opts.transitionEasing,
                    'transition': 'max-height ' + opts.transitionSpeed + 'ms ' + opts.transitionEasing
                });
            } else {
                $content.css({
                    '-webkit-transition': '',
                    'transition': ''
                });
            }
        }

        function calculateHeight($el) {
            var height = 0;

            $el.children().each(function() {
                height = height + $(this).outerHeight(true);
            });

            $el.data('oHeight', height);
        }

        function updateParentHeight($parentAccordion, $currentAccordion, qty, operation) {
            var $content = $parentAccordion.filter('.accordeon--open').find('> [data-content]'),
                $childs = $content.find('[data-accordeon].accordeon--open > [data-content]'),
                $matched;

            if(!opts.singleOpen) {
                $childs = $childs.not($currentAccordion.siblings('[data-accordeon].accordeon--open').find('> [data-content]'));
            }

            $matched = $content.add($childs);

            if($parentAccordion.hasClass('accordeon--open')) {
                $matched.each(function() {
                    var currentHeight = $(this).data('oHeight');

                    switch (operation) {
                        case '+':
                            $(this).data('oHeight', currentHeight + qty);
                            break;
                        case '-':
                            $(this).data('oHeight', currentHeight - qty);
                            break;
                        default:
                            throw 'updateParentHeight method needs an operation';
                    }

                    $(this).css('max-height', $(this).data('oHeight'));
                });
            }
        }

        function refreshHeight($accordeon) {
            if($accordeon.hasClass('accordeon--open')) {
                var $content = $accordeon.find('> [data-content]'),
                    $childs = $content.find('[data-accordeon].accordeon--open > [data-content]'),
                    $matched = $content.add($childs);

                calculateHeight($matched);

                $matched.css('max-height', $matched.data('oHeight'));
            }
        }

        function closeAccordion($accordeon, $content) {
            $accordeon.trigger('accordeon.close');

            if(CSStransitions) {
                if(accordeonHasParent) {
                    var $parentAccordions = $accordeon.parents('[data-accordeon]');

                    updateParentHeight($parentAccordions, $accordeon, $content.data('oHeight'), '-');
                }

                $content.css(closedCSS);

                $accordeon.removeClass('accordeon--open');
            } else {
                $content.css('max-height', $content.data('oHeight'));

                $content.animate(closedCSS, opts.transitionSpeed);

                $accordeon.removeClass('accordeon--open');
            }
        }

        function openAccordion($accordeon, $content) {
            $accordeon.trigger('accordeon.accordeon--open');
            if(CSStransitions) {
                toggleTransition($content);

                if(accordeonHasParent) {
                    var $parentAccordions = $accordeon.parents('[data-accordeon]');

                    updateParentHeight($parentAccordions, $accordeon, $content.data('oHeight'), '+');
                }

                requestAnimFrame(function() {
                    $content.css('max-height', $content.data('oHeight'));
                });

                $accordeon.addClass('accordeon--open');
            } else {
                $content.animate({
                    'max-height': $content.data('oHeight')
                }, opts.transitionSpeed, function() {
                    $content.css({'max-height': 'none'});
                });

                $accordeon.addClass('accordeon--open');
            }
        }

        function closeSiblingAccordions($accordeon) {
            var $accordeonGroup = $accordeon.closest(opts.groupElement);

            var $siblings = $accordeon.siblings('[data-accordeon]').filter('.accordeon--open'),
                $siblingsChildren = $siblings.find('[data-accordeon]').filter('.accordeon--open');

            var $otherAccordions = $siblings.add($siblingsChildren);

            $otherAccordions.each(function() {
                var $accordeon = $(this),
                    $content = $accordeon.find(opts.contentElement);

                closeAccordion($accordeon, $content);
            });

            $otherAccordions.removeClass('accordeon--open');
        }

        function toggleAccordion() {
            var isAccordionGroup = (opts.singleOpen) ? $accordeon.parents(opts.groupElement).length > 0 : false;

            calculateHeight($content);

            if(isAccordionGroup) {
                closeSiblingAccordions($accordeon);
            }

            if($accordeon.hasClass('accordeon--open')) {
                closeAccordion($accordeon, $content);
            } else {
                openAccordion($accordeon, $content);
            }
            return false;
        }

        function addEventListeners() {
            $controls.on('click', toggleAccordion);

            $controls.on('accordeon.toggle', function() {
                if(opts.singleOpen && $controls.length > 1) {
                    return false;
                }

                toggleAccordion();
            });

            $(window).on('resize', debounce(function() {
                refreshHeight($accordeon);
            }));
        }

        function setup() {
            $content.each(function() {
                var $curr = $(this);

                if($curr.css('max-height') != 0) {
                    if(!$curr.closest('[data-accordeon]').hasClass('accordeon--open')) {
                        $curr.css({ 'max-height': 0, 'overflow': 'hidden' });
                    } else {
                        toggleTransition($curr);
                        calculateHeight($curr);

                        $curr.css('max-height', $curr.data('oHeight'));
                    }
                }
            });

            if(!$accordeon.attr('data-accordeon')) {
                $accordeon.attr('data-accordeon', '');
                $accordeon.find(opts.controlElement).attr('data-control', '');
                $accordeon.find(opts.contentElement).attr('data-content', '');
            }
        }

        setup();
        addEventListeners();
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Accordion( this, options ));
            }
        });
    }

})( jQuery, window, document );

$(window).load(function (){
    $('.accordeon').accordeon({
        "transitionSpeed": 200,
        "singleOpen": true
    });
});