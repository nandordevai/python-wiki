CaduceusWiki.Editor = (function() {

    function setEditable() {
        var title = document.getElementsByTagName('h1')[0];
        title.contentEditable = true;
        var content = document.getElementById('content');
        content.contentEditable = true;
        content.addEventListener('click', function(event) {
            if (event.target.tagName == 'A') {
                saveArticle(false, function() {
                    window.location = event.target.getAttribute('href').toString();
                });
            } else if (event.target.tagName == 'INPUT' && event.target.parentElement.tagName === 'LI') {
                setStrikethrough(event.target);
            }
        });
    }

    function setStrikethrough(target) {
        if (target.checked) {
            target.parentElement.style.textDecoration = 'line-through';
            target.setAttribute('checked', 'checked');
        } else {
            target.parentElement.style.textDecoration = '';
            target.removeAttribute('checked');
        }
    }

    function getMethod() {
        if (content.getAttribute('data-empty') === 'true') {
            return 'POST';
        } else {
            return 'PUT';
        }
    }

    function saveArticle(async, callback) {
        if (async === null) {
            async = true;
        } else {
            async = false;
        }
        var method = getMethod();
        var article = document.getElementsByTagName('article')[0];
        var content = document.getElementById('content');
        var request = new XMLHttpRequest();
        request.open(method, document.URL, async);
        content.setAttribute('data-empty', 'false');
        var formData = new FormData();
        formData.append('content', article.innerHTML);
        if (callback) {
            request.onload = callback;
        }
        request.send(formData);
        refreshSidebar();
    }

    function refreshSidebar() {
        var request = new XMLHttpRequest();
        request.open('GET', '/files');
        request.onload = function() {
            var linkList = document.getElementById('pages');
            linkList.innerHTML = '';
            response = JSON.parse(this.responseText);
            response.pages.forEach(function(page) {
                var a = document.createElement('a');
                var text = document.createTextNode(page);
                a.appendChild(text);
                a.setAttribute('href', '/' + page);
                linkList.appendChild(a);
            });
        };
        request.send();
    }

    function deleteArticle() {
        var request = new XMLHttpRequest();
        request.open('DELETE', document.URL);
        request.send();
        request.onload = function() {
            window.location = '/';
        };
    }

    function insertLink() {
        var selectedText = document.getSelection().toString();
        document.execCommand('createLink', true, selectedText);
    }

    function toggleBlock(tagName) {
        var node = document.getSelection().anchorNode.parentElement;
        if (node.tagName == tagName) {
            document.execCommand('formatBlock', true, 'P');
        } else {
            document.execCommand('formatBlock', true, tagName);
        }
    }

    function initEventHandlers() {
        buttons = [
            {
                id: 'delete',
                action: deleteArticle
            },
            {
                id: 'link',
                action: insertLink
            },
            {
                id: 'list',
                action: function() {document.execCommand('insertUnorderedList');}
            },
            {
                id: 'del',
                action: function() {document.execCommand('strikeThrough');}
            },
            {
                id: 'h2',
                action: function() {toggleBlock('H2');}
            },
            {
                id: 'blockquote',
                action: function() {toggleBlock('BLOCKQUOTE');}
            }
        ];
        buttons.forEach(function(button) {
            document.getElementById(button.id).addEventListener('click', button.action);
        });
        window.addEventListener('keyup', handleKeyUp);
    }

    return {
        init: function() {
            setEditable();
            initEventHandlers();
        },

        checkBeforeUnload: function() {
            saveArticle(false);
        }
    };

})();
