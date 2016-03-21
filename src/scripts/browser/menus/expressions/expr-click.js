import manifest from '../../../../package.json';
import analyticsTracker from '../../utils/analytics';
import raffle from '../../components/raffle';
import prefs from '../../utils/prefs';
import dialog from 'dialog';
import shell from 'shell';
import app from 'app';

/**
 * Call the handler for the check-for-update event.
 */
export function cfuCheckForUpdate() {
  return function() {
    global.application.autoUpdateManager.handleMenuCheckForUpdate();
  };
}

/**
 * Call the handler for the update-available event.
 */
export function cfuUpdateAvailable() {
  return function() {
    global.application.autoUpdateManager.handleMenuUpdateAvailable();
  };
}

/**
 * Call the handler for the update-downloaded event.
 */
export function cfuUpdateDownloaded() {
  return function() {
    global.application.autoUpdateManager.handleMenuUpdateDownloaded();
  };
}

/**
 * Enable or disable automatic checks for update.
 */
export function checkForUpdateAuto(valueExpr) {
  return function() {
    const check = valueExpr.apply(this, arguments);
    global.application.autoUpdateManager.setAutoCheck(check);
  };
}

/**
 * Quit the app.
 */
export function appQuit() {
  return function() {
    app.quit();
  };
}

/**
 * Open the url externally, in a browser.
 */
export function openUrl(url) {
  return function() {
    shell.openExternal(url);
  };
}

/**
 * Send a message to the browserWindow's webContents.
 */
export function sendToWebContents(channel, ...valueExprs) {
  return function(menuItem, browserWindow) {
    const values = valueExprs.map(e => e.apply(this, arguments));
    browserWindow.webContents.send(channel, ...values);
  };
}

/**
 * Send a message directly to the webview.
 */
export function sendToWebView(channel, ...valueExprs) {
  return function(menuItem, browserWindow) {
    const values = valueExprs.map(e => e.apply(this, arguments));
    browserWindow.webContents.send('fwd-webview', channel, ...values);
  };
}

/**
 * Reload the browser window.
 */
export function reloadWindow() {
  return function(menuItem, browserWindow) {
    browserWindow.reload();
  };
}

/**
 * Reset the window's position and size.
 */
export function resetWindow() {
  return function(menuItem, browserWindow) {
    const bounds = prefs.getDefault('window-bounds');
    browserWindow.setSize(bounds.width, bounds.height, true);
    browserWindow.center();
  };
}

/**
 * Show (and focus) the window.
 */
export function showWindow() {
  return function(menuItem, browserWindow) {
    if (browserWindow) {
      browserWindow.show();
    } else {
      const windowManager = global.application.mainWindowManager;
      if (windowManager.window) {
        windowManager.window.show();
      }
    }
  };
}

/**
 * Toggle whether the window is in full screen or not.
 */
export function toggleFullScreen() {
  return function(menuItem, browserWindow) {
    const newState = !browserWindow.isFullScreen();
    browserWindow.setFullScreen(newState);
  };
}

/**
 * Toggle the dev tools panel.
 */
export function toggleDevTools() {
  return function(menuItem, browserWindow) {
    browserWindow.toggleDevTools();
  };
}

/**
 * Whether the window should always appear on top.
 */
export function floatOnTop(flagExpr) {
  return function(menuItem, browserWindow) {
    const flag = flagExpr.apply(this, arguments);
    browserWindow.setAlwaysOnTop(flag);
  };
}

/**
 * Show or hide the tray icon.
 */
export function showInTray(flagExpr) {
  return function() {
    const show = flagExpr.apply(this, arguments);
    if (show) {
      global.application.trayManager.create();
    } else {
      global.application.trayManager.destroy();
    }
  };
}

/**
 * Show or hide the dock icon.
 */
export function showInDock(flagExpr) {
  return function() {
    if (app.dock) {
      const show = flagExpr.apply(this, arguments);
      if (show) {
        app.dock.show();
      } else {
        app.dock.hide();
      }
    }
  };
}

/**
 * Whether the app should launch automatically when the OS starts.
 */
export function launchOnStartup(enabledExpr) {
  return function() {
    const enabled = enabledExpr.apply(this, arguments);
    if (enabled) {
      global.application.autoLauncher.enable(function(err) {
        if (err) {
          log('could not enable auto-launcher');
          logError(err);
        }
      });
    } else {
      global.application.autoLauncher.disable(function(err) {
        if (err) {
          log('could not disable auto-launcher');
          logError(err);
        }
      });
    }
  };
}

/**
 * If flag is true, the dock badge will be hidden.
 */
export function hideDockBadge(flagExpr) {
  return function() {
    const flag = flagExpr.apply(this, arguments);
    if (flag && app.dock && app.dock.setBadge) {
      app.dock.setBadge('');
    }
  };
}

/**
 * Show a dialog with information about giveaways.
 */
export function openRaffleDialog() {
  const code = raffle.getCode();
  return function() {
    dialog.showMessageBox({
      type: 'info',
      buttons: ['OK', 'Join the giveaway'],
      message: 'Your Raffle Code is: ' + code,
      detail: [
        'Don\'t know what this is about?',
        '',
        'From time to time, I organize giveaways in order to make the app more popular and give prizes to the users. The more people use my app, the happier I am! So if you\'d like to join the giveaway, click Join below.',
        '',
        'Note: giveaways happen regularly, but if there are none right now, please check back later. Good luck!'
      ].join('\n')
    }, function(response) {
      if (response === 1) {
        const url = manifest.raffleUrl;
        log('user clicked "Join the giveaway", opening url', url);
        shell.openExternal(url);
      }
    });
  };
}

// Analytics
export const analytics = {

  /**
   * Track an event.
   */
  trackEvent: function(...args) {
    return function() {
      analyticsTracker.trackEvent(...args);
    };
  },

  /**
   * Track a goal.
   */
  trackGoal: function(...args) {
    return function() {
      analyticsTracker.trackGoal(...args);
    };
  }

};
