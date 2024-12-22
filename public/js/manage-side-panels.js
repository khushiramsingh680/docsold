function resizeMain() {
    const leftPanelHidden = sessionStorage.getItem('hide-left-panel');
    const rightPanelHidden = sessionStorage.getItem('hide-right-panel');
    if (leftPanelHidden && rightPanelHidden) {
        document.querySelectorAll('[role="main"]')[0].style.flex = '0 0 100%';
        document.querySelectorAll('[role="main"]')[0].style.maxWidth = '100%';
    } else if ((leftPanelHidden || rightPanelHidden) && window.innerWidth >= 768 && window.innerWidth < 1200) {
        document.querySelectorAll('[role="main"]')[0].style.flex = '0 0 100%';
        document.querySelectorAll('[role="main"]')[0].style.maxWidth = '100%';
    } else if ((leftPanelHidden || rightPanelHidden) && window.innerWidth >= 1200) {
        document.querySelectorAll('[role="main"]')[0].style.flex = '0 0 83.3333333%';
        document.querySelectorAll('[role="main"]')[0].style.maxWidth = '83.3333333%';
    } else {
        document.querySelectorAll('[role="main"]')[0].removeAttribute('style');
    }
    return false;
}

function manageLeftPanel() {
    const leftPanel = document.getElementsByClassName('td-sidebar')[0];
    const leftPanelButton = document.getElementById('left-panel-manager');
    const leftPanelHidden = sessionStorage.getItem('hide-left-panel');
    if (leftPanelHidden) {
        leftPanel.setAttribute('style', 'display: none !important');
        leftPanelButton.setAttribute('class', 'button-left-open');
        leftPanelButton.setAttribute('title', 'Show sidebar');
    } else {
        leftPanel.removeAttribute('style');
        leftPanelButton.setAttribute('class', 'button-left');
        leftPanelButton.setAttribute('title', 'Hide sidebar');
    }
}

function manageRightPanel() {
    const rightPanel = document.getElementsByClassName('td-sidebar-toc')[0];
    const rightPanelButton = document.getElementById('right-panel-manager');
    const rightPanelHidden = sessionStorage.getItem('hide-right-panel');
    if (rightPanelHidden) {
        rightPanel.setAttribute('style', 'display: none !important');
        rightPanelButton.setAttribute('class', 'button-right-open');
        rightPanelButton.setAttribute('title', 'Show sidebar');
    } else {
        rightPanel.removeAttribute('style');
        rightPanelButton.setAttribute('class', 'button-right');
        rightPanelButton.setAttribute('title', 'Hide sidebar');
    }
}

jQuery(document).ready(function() {

    jQuery($('#left-panel-manager')).click(function() {
        const leftPanelHidden = sessionStorage.getItem('hide-left-panel');
        if (leftPanelHidden) {
            sessionStorage.removeItem('hide-left-panel');
        } else {
            sessionStorage.setItem('hide-left-panel', 'true');
        }
        manageLeftPanel();
        manageRightPanel();
        resizeMain();
    });

    jQuery($('#right-panel-manager')).click(function() {
        const rightPanelHidden = sessionStorage.getItem('hide-right-panel');
        if (rightPanelHidden) {
            sessionStorage.removeItem('hide-right-panel');
        } else {
            sessionStorage.setItem('hide-right-panel', 'true');
        }
        manageLeftPanel();
        manageRightPanel();
        resizeMain();
    });
    if (window.innerWidth < 768) {
        sessionStorage.removeItem('hide-right-panel');
        sessionStorage.removeItem('hide-left-panel');
    } else if (window.innerWidth < 1200) {
        sessionStorage.removeItem('hide-right-panel');
    }
    manageLeftPanel();
    manageRightPanel();
    resizeMain();
});