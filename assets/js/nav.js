+ function($) {
    "use strict";
    var backdrop = '.dropdown-backdrop'
    var toggle = '[data-toggle=dropdown]'
    var Dropdown = function(element) {
        var $el = $(element).on('click.bs.dropdown', this.toggle)
    }
    Dropdown.prototype.toggle = function(e) {
        var $this = $(this)
        if ($this.is('.disabled, :disabled')) return
        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')
        clearMenus()
        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
            }
            $parent.trigger(e = $.Event('show.bs.dropdown'))
            if (e.isDefaultPrevented()) return
            $parent.toggleClass('open').trigger('shown.bs.dropdown')
            $this.focus()
        }
        return false
    }
    Dropdown.prototype.keydown = function(e) {
        if (!/(38|40|27)/.test(e.keyCode)) return
        var $this = $(this)
        e.preventDefault()
        e.stopPropagation()
        if ($this.is('.disabled, :disabled')) return
        var $parent = getParent($this)
        var isActive = $parent.hasClass('open')
        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) $parent.find(toggle).focus()
            return $this.click()
        }
        var $items = $('[role=menu] li:not(.divider):visible a', $parent)
        if (!$items.length) return
        var index = $items.index($items.filter(':focus'))
        if (e.keyCode == 38 && index > 0) index--
            if (e.keyCode == 40 && index < $items.length - 1) index++
                if (!~index) index = 0
        $items.eq(index).focus()
    }

    function clearMenus() {
        $(backdrop).remove()
        $(toggle).each(function(e) {
            var $parent = getParent($(this))
            if (!$parent.hasClass('open')) return
            $parent.trigger(e = $.Event('hide.bs.dropdown'))
            if (e.isDefaultPrevented()) return
            $parent.removeClass('open').trigger('hidden.bs.dropdown')
        })
    }

    function getParent($this) {
        var selector = $this.attr('data-target')
        if (!selector) {
            selector = $this.attr('href')
            selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '')
        }
        var $parent = selector && $(selector)
        return $parent && $parent.length ? $parent : $this.parent()
    }
    var old = $.fn.dropdown
    $.fn.dropdown = function(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('dropdown')
            if (!data) $this.data('dropdown', (data = new Dropdown(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }
    $.fn.dropdown.Constructor = Dropdown
    $.fn.dropdown.noConflict = function() {
        $.fn.dropdown = old
        return this
    }
    $(document).on('click.bs.dropdown.data-api', clearMenus).on('click.bs.dropdown.data-api', '.dropdown form', function(e) {
        e.stopPropagation()
    }).on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]', Dropdown.prototype.keydown)
}(jQuery); + function($) {
    "use strict";
    var Modal = function(element, options) {
        this.options = options
        this.$element = $(element)
        this.$backdrop = this.isShown = null
        if (this.options.remote) this.$element.load(this.options.remote)
    }
    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    }
    Modal.prototype.toggle = function(_relatedTarget) {
        return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
    }
    Modal.prototype.show = function(_relatedTarget) {
        var that = this
        var e = $.Event('show.bs.modal', {
            relatedTarget: _relatedTarget
        })
        this.$element.trigger(e)
        if (this.isShown || e.isDefaultPrevented()) return
        this.isShown = true
        this.escape()
        this.$element.on('click.dismiss.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
        this.backdrop(function() {
            var transition = $.support.transition && that.$element.hasClass('fade')
            if (!that.$element.parent().length) {
                that.$element.appendTo(document.body)
            }
            that.$element.show()
            if (transition) {
                that.$element[0].offsetWidth
            }
            that.$element.addClass('in').attr('aria-hidden', false)
            that.enforceFocus()
            var e = $.Event('shown.bs.modal', {
                relatedTarget: _relatedTarget
            })
            transition ? that.$element.find('.modal-dialog').one($.support.transition.end, function() {
                that.$element.focus().trigger(e)
            }).emulateTransitionEnd(300) : that.$element.focus().trigger(e)
        })
    }
    Modal.prototype.hide = function(e) {
        if (e) e.preventDefault()
        e = $.Event('hide.bs.modal')
        this.$element.trigger(e)
        if (!this.isShown || e.isDefaultPrevented()) return
        this.isShown = false
        this.escape()
        $(document).off('focusin.bs.modal')
        this.$element.removeClass('in').attr('aria-hidden', true).off('click.dismiss.modal')
        $.support.transition && this.$element.hasClass('fade') ? this.$element.one($.support.transition.end, $.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal()
    }
    Modal.prototype.enforceFocus = function() {
        $(document).off('focusin.bs.modal').on('focusin.bs.modal', $.proxy(function(e) {
            if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                this.$element.focus()
            }
        }, this))
    }
    Modal.prototype.escape = function() {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keyup.dismiss.bs.modal', $.proxy(function(e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keyup.dismiss.bs.modal')
        }
    }
    Modal.prototype.hideModal = function() {
        var that = this
        this.$element.hide()
        this.backdrop(function() {
            that.removeBackdrop()
            that.$element.trigger('hidden.bs.modal')
        })
    }
    Modal.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }
    Modal.prototype.backdrop = function(callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : ''
        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate
            this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(document.body)
            this.$element.on('click.dismiss.modal', $.proxy(function(e) {
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static' ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this)
            }, this))
            if (doAnimate) this.$backdrop[0].offsetWidth
            this.$backdrop.addClass('in')
            if (!callback) return
            doAnimate ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback()
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')
            $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback()
        } else if (callback) {
            callback()
        }
    }
    var old = $.fn.modal
    $.fn.modal = function(option, _relatedTarget) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.modal')
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }
    $.fn.modal.Constructor = Modal
    $.fn.modal.noConflict = function() {
        $.fn.modal = old
        return this
    }
    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function(e) {
        var $this = $(this)
        var href = $this.attr('href')
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')))
        var option = $target.data('modal') ? 'toggle' : $.extend({
            remote: !/#/.test(href) && href
        }, $target.data(), $this.data())
        e.preventDefault()
        $target.modal(option, this).one('hide', function() {
            $this.is(':visible') && $this.focus()
        })
    })
    $(document).on('show.bs.modal', '.modal', function() {
        $(document.body).addClass('modal-open')
    }).on('hidden.bs.modal', '.modal', function() {
        $(document.body).removeClass('modal-open')
    })
}(jQuery);

function replaceHeader(content) {
    jQuery(document).ready(function() {
        jQuery("#global-header > nav > .wrapper").replaceWith(content);
        jQuery("#global-header > nav > .wrapper").fadeIn(function() {
            jQuery(this).find("a[href*='" + window.location.hostname + "']").addClass("current");
            if (typeof afterReplaceNav === 'function') {
                afterReplaceNav();
            }
        });
    });
}

function replaceFooter(content) {
    jQuery(document).ready(function() {
        jQuery("#global-footer").replaceWith(content);
        jQuery("#global-footer").fadeIn(function() {
            jQuery(this).find("a[href*='" + window.location.hostname + "']").addClass("current");
            if (typeof afterReplaceNav === 'function') {
                afterReplaceNav();
            }
        });
    });
}
replaceHeader("<div class=\"wrapper\">\n    <a class=\"ghost-logo\" href=\"https://ghost.org/\"><span>Ghost</span></a>\n\n\n    <button type=\"button\" class=\"mobile-menu\" data-toggle=\"collapse\" data-target=\".navbar-collapse\"><span class=\"hidden\">Menu</span></button>\n    <ul id=\"main-menu\" class=\"navbar-collapse collapse\">\n        <li class=\"home-button-container\"><a class=\"\" href=\"https://ghost.org/\">Home</a></li>\n        <li><a class=\"\" href=\"https://ghost.org/pricing/\">Pricing</a></li>\n        <li><li class=''><a class=\"\" href=\"https://ghost.org/about/\">About</a></li></li>\n        <li><a href=\"http://support.ghost.org\">Support</a></li>\n        <li class=\"extra\"><a href=\"http://blog.ghost.org\">Blog</a></li>\n        <li class=\"signup-button-container\"><a class=\"signup\" href=\"https://ghost.org/\">Test it Out</a></li>\n        <li class=\"login-button-container\"><a class=\"login\" href=\"https://ghost.org/login/\" rel=\"nofollow\">Sign in</a></li>\n    </ul>\n\n</div>\n");
replaceFooter("<footer class=\"global-footer\" id=\"global-footer\">\n    <nav class=\"footer-nav-grid\" role=\"navigation\">\n        <ul class=\"footer-nav-column footer-nav-ghost\">\n            <li class=\"footer-nav-heading\">Ghost</li>\n            <li class=\"footer-nav-link\"><a href=\"http://ghost.org\">Features</a></li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/pricing/\">Pricing</a></li>\n            <li class=\"footer-nav-link\"><a href=\"http://marketplace.ghost.org\">Marketplace</a></li>\n            <li class=\"footer-nav-link\"><a href=\"http://status.ghost.org\">Status</a></li>\n        </ul>  \n        <ul class=\"footer-nav-column footer-nav-company\">\n            <li class=\"footer-nav-heading\">Company</li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/about/\">About us</a></li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/team/\">Our team</a></li>\n            <li class=\"footer-nav-link\"><a href=\"http://ideas.ghost.org\">Feedback</a></li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/about/contact/\">Contact</a></li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/about/logos/\">Logos</a></li>\n        </ul> \n        <ul class=\"footer-nav-column footer-nav-compare\">\n            <li class=\"footer-nav-heading\">Compare</li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/vs/wordpress\">WordPress</a></li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/vs/tumblr\">Tumblr</a></li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/vs/medium\">Medium</a></li>\n        </ul> \n        <ul class=\"footer-nav-column footer-nav-developers\">\n            <li class=\"footer-nav-heading\">Developers</li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/download/\">Download</a></li>\n            <li class=\"footer-nav-link\"><a href=\"http://docs.ghost.org\">Documentation</a></li>\n            <li class=\"footer-nav-link\"><a class=\"\" href=\"https://ghost.org/about/contribute/\">Contribute</a></li>\n            <li class=\"footer-nav-link\"><a href=\"https://dev.ghost.org\">Dev blog</a></li>\n            <li class=\"footer-nav-link\"><a href=\"https://ghost.org/slack/\">Slack</a></li>\n        </ul> \n        <ul class=\"footer-nav-column footer-nav-suport\">\n            <li class=\"footer-nav-heading\">Support</li>\n            <li class=\"footer-nav-link\"><a href=\"http://support.ghost.org/faq/\">FAQ</a></li>\n            <li class=\"footer-nav-link\"><a href=\"http://support.ghost.org/\">Help center</a></li>\n            <li class=\"footer-nav-link\"><a href=\"http://support.ghost.org/how-to-use-ghost/\">Ghost guide</a></li>\n            <li class=\"footer-nav-link\"><a href=\"https://blog.ghost.org/markdown/\">Markdown</a></li>\n            <li class=\"footer-nav-link\"><a href=\"https://twitter.com/intent/tweet?text=%40TryGhost+Hi%21+Can+you+help+me+with+&related=TryGhost\" onclick=\"window.open(this.href, 'twitter-share', 'width=550,height=235');return false;\">Tweet at us</a></li>\n        </ul> \n    </nav>\n    <div class=\"logo-grid\">\n        <div class=\"poweredby logo-grid-item\"><img src=\"https://ghost.org/assets/logo-minidigitalocean-1bb39c0755ac79befc56ca39d7889eb5.png\" alt=\"Ghost\" /> Powered <em>by</em> <a href=\"https://www.digitalocean.com/?ref=ghost\" target=\"_blank\">DigitalOcean</a></div> \n        <div class=\"logo logo-ghost-footer logo-grid-item\"><a href=\"/\"><img src=\"https://ghost.org/assets/logo-minighost-0f5476cf6a52adff2f2a67e4f16d3e29.png\" alt=\"Ghost\" /></a></div>\n    </div>\n    \n</footer>");
