function restoreTabSelections() {
    if(window.localStorage){
        var selectionsJSON = window.localStorage.getItem("tabSelections");
        if(selectionsJSON){
          var tabSelections = JSON.parse(selectionsJSON);
        }else{
          var tabSelections = {};
        }
        Object.keys(tabSelections).forEach(function(tabGroup) {
          var tabItem = tabSelections[tabGroup];
          switchTab(tabGroup, tabItem);
        });
    }
}

function getSearchInput() {
    // get the search input (0 on desktop / 1 on mobile)
    let $searchInput = $($('.td-search-input')[0]);
    if (getComputedStyle($searchInput[0].closest('div')).display == 'none') {
        if ($('.td-search-input')[1]) {
            $searchInput = $($('.td-search-input')[1]);
        }
    };
    return $searchInput;
}

function unhighlightSearch() {
    sessionStorage.removeItem('search-value');
    $('.highlightable').unhighlight({ element: 'mark' });
}

function highlightSearch() {
    const $searchInput = getSearchInput();
    if (sessionStorage.getItem('search-value')) {
        var searchValue = sessionStorage.getItem('search-value')
        $searchInput.val(searchValue);
        $('.highlightable').unhighlight({ element: 'mark' }).highlight(searchValue, { element: 'mark' });
    }
}

jQuery(document).ready(function() {
    restoreTabSelections();
    var ajax;
    const $searchInput = getSearchInput();
    jQuery($searchInput.closest('form')).submit(function() {
        var input = jQuery($searchInput),
            value = input.val();
        if (!value.length) {
            unhighlightSearch();
            return;
        }

        sessionStorage.setItem('search-value', value);

        if (ajax && ajax.abort) ajax.abort();

        jQuery($('.search-result-close-button')).click(() => {
            unhighlightSearch();
        });
        highlightSearch();
    });

    highlightSearch();
});

jQuery.extend({
    highlight: function(node, re, nodeName, className) {
        if (node.nodeType === 3) {
            var match = node.data.match(re);
            if (match) {
                var highlight = document.createElement(nodeName || 'span');
                highlight.className = className || 'yellow-highlight';
                var wordNode = node.splitText(match.index);
                wordNode.splitText(match[0].length);
                var wordClone = wordNode.cloneNode(true);
                highlight.appendChild(wordClone);
                wordNode.parentNode.replaceChild(highlight, wordNode);
                return 1; //skip added node in parent
            }
        } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
            !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
            !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
            for (var i = 0; i < node.childNodes.length; i++) {
                i += jQuery.highlight(node.childNodes[i], re, nodeName, className);
            }
        }
        return 0;
    }
});

jQuery.fn.unhighlight = function(options) {
    var settings = {
        className: 'yellow-highlight',
        element: 'span'
    };
    jQuery.extend(settings, options);

    return this.find(settings.element + "." + settings.className).each(function() {
        var parent = this.parentNode;
        parent.replaceChild(this.firstChild, this);
        parent.normalize();
    }).end();
};

jQuery.fn.highlight = function(words, options) {
    var settings = {
        className: 'yellow-highlight',
        element: 'span',
        caseSensitive: false,
        wordsOnly: false
    };
    jQuery.extend(settings, options);

    if (!words) { return; }

    if (words.constructor === String) {
        words = [words];
    }
    words = jQuery.grep(words, function(word, i) {
        return word != '';
    });
    words = jQuery.map(words, function(word, i) {
        return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    });
    if (words.length == 0) { return this; }
    ;

    var flag = settings.caseSensitive ? "" : "i";
    var pattern = "(" + words.join("|") + ")";
    if (settings.wordsOnly) {
        pattern = "\\b" + pattern + "\\b";
    }
    var re = new RegExp(pattern, flag);

    return this.each(function() {
        jQuery.highlight(this, re, settings.element, settings.className);
    });
};
