# Mobile Security Engineering Manual: Hardware-Level Screenshot & Screen Recording Prevention

This directory houses the comprehensive implementation blueprints for preventing unauthorized content distribution via OS-level screenshotting, screen capture, and screen recording utilities. This guide addresses **Android (Java/Kotlin)**, **iOS (Swift/Objective-C)**, and **JavaScript-to-Native Web Bridging** methods suitable for Capacitor, React Native, or a custom native WebView wrapper containing your web-based study platform.

---

## 1. Android Native Implementation (`FLAG_SECURE`)

Under Android, the system provides a robust, hardware-backed mechanism called `WindowManager.LayoutParams.FLAG_SECURE`. When enabled, this flag instructs the OS and the window manager to treat the application's window as a secure boundary.

### Core Security Effects:
* **Screenshot Blocking:** System-level screenshots through key binds (e.g., Power + Volume Down) are rejected immediately.
* **Screen Recording Protection:** Screen recording applications (including internal capture modules and third-party recording software) capture only a solid black surface.
* **Recent Apps Switcher Masking:** In the system overview (Recent Apps list), the preview thumbnail of your application is replaced with a black tile to avoid leaking course materials.
* **Chromecast / Miracast Blocking:** Direct hardware casting is rejected or displays a black window on the external screen.

### implementation: Kotlin (`MainActivity.kt`)

```kotlin
package com.yourcompany.studyplatform

import android.os.Bundle
import android.view.WindowManager
import com.getcapacitor.BridgeActivity // If using Capacitor, otherwise extend AppCompatActivity or Activity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Apply FLAG_SECURE globally to the primary activity window
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )
    }
}
```

### Implementation: Java (`MainActivity.java`)

```java
package com.yourcompany.studyplatform;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity; // Adjust based on your wrapper

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Prevent screen capture and recording on Android
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
```

---

## 2. iOS Native Implementation (Screen Protection & Blurring)

On iOS, there is no direct equivalent of Android's `FLAG_SECURE` that can be toggled on a standard window. Instead, iOS relies on notifications for background actions and screen recording changes to selectively blur views, alongside a highly effective native UI architecture hack (detailed in Section 3).

### Monitoring Capture Notifications (`AppDelegate.swift`)

You can intercept screenshot notifications and active screen-state recording flags, allowing you to dismiss, blur, or log warning signals when the user acts.

```swift
import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var securityOverlayView: UIView?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        
        // Setup observers for screenshots and recording
        setupSecurityObservers()
        
        return true
    }

    private func setupSecurityObservers() {
        // 1. Detect when a standard static screenshot has been taken
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleScreenshotTaken),
            name: UIApplication.userDidTakeScreenshotNotification,
            object: nil
        )
        
        // 2. Monitor screen-record state changes (e.g., control center recorder, airplay, cable recording)
        if #available(iOS 11.0, *) {
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(handleScreenCapturedStateChanged),
                name: UIScreen.capturedDidChangeNotification,
                object: nil
            )
            // Initial check in case capture started prior to app launch
            checkScreenCaptureState()
        }
    }

    @objc private func handleScreenshotTaken() {
        print("🔒 Security Block: Screenshot Detected!")
        // Present a secure alerting sequence, log telemetry, or momentarily force blur
        showSecurityAlert()
    }

    @objc private func handleScreenCapturedStateChanged() {
        checkScreenCaptureState()
    }

    private func checkScreenCaptureState() {
        if #available(iOS 11.0, *) {
            if UIScreen.main.isCaptured {
                // Active screen recorder detected
                applySecurityBlur()
            } else {
                // Recording stopped
                removeSecurityBlur()
            }
        }
    }

    private func applySecurityBlur() {
        guard securityOverlayView == nil, let window = self.window else { return }
        
        let blurEffect = UIBlurEffect(style: .dark)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.frame = window.bounds
        blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        let messageLabel = UILabel()
        messageLabel.text = "🔒 Premium Content Protected\nScreen recording is strictly prohibited."
        messageLabel.textColor = .white
        messageLabel.font = UIFont.systemFont(ofSize: 16, weight: .bold)
        messageLabel.numberOfLines = 0
        messageLabel.textAlignment = .center
        messageLabel.frame = blurView.bounds
        
        blurView.contentView.addSubview(messageLabel)
        
        window.addSubview(blurView)
        self.securityOverlayView = blurView
    }

    private func removeSecurityBlur() {
        securityOverlayView?.removeFromSuperview()
        securityOverlayView = nil
    }

    private func showSecurityAlert() {
        guard let rootController = window?.rootViewController else { return }
        let alert = UIAlertController(
            title: "Security Shield",
            message: "Screenshots and screen recordings are strictly disabled on this learning platform.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        rootController.present(alert, animated: true, completion: nil)
    }
}
```

---

## 3. iOS Advanced Implementation: The UITextField "Secure View Hack"

The screen-recording check (via `UIScreen.main.isCaptured`) is reactive. This means the system must start recording before your app can detect it and block it, creating a risk that the initial seconds of recording might capture sensitive content.

To solve this, iOS engineers use a brilliant "hardware-level" hack. Inside iOS, `UITextField` with `isSecureTextEntry = true` natively renders all subviews invisible to the system screenshot engine and AirPlay mirroring directly at the GPU compositor layer.

By hosting your primary mobile activity inside a customized container subclassed from `UITextField`'s internal secure subview layer, the app window automatically screens out as black or blank whenever a screenshot or video recording is running.

### Xcode/Swift Implementation: `SecureContentViewContainer.swift`

```swift
import UIKit

/// A container view which fully secures its nested UI from active screenshots and recording.
class SecureContentViewContainer: UIView {
    
    // The underlying secure textfield used to cloak subviews
    private let secureTextField = UITextField()
    
    // Access points to the system-created hidden secure container inside the UITextField
    private var secureContainerView: UIView? {
        // Obtains the private layer where iOS applies secure entry rendering masks
        return secureTextField.subviews.first(where: { 
            type(of: $0).description().contains("CanvasView") || 
            type(of: $0).description().contains("LayoutContainer") 
        }) ?? secureTextField.subviews.first
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupSecureTextField()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupSecureTextField()
    }
    
    private func setupSecureTextField() {
        // Configure secure entry configuration
        secureTextField.isSecureTextEntry = true
        secureTextField.isEnabled = false
        
        // Hide from visual layout while operating in background
        secureTextField.translatesAutoresizingMaskIntoConstraints = false
        addSubview(secureTextField)
        
        NSLayoutConstraint.activate([
            secureTextField.topAnchor.constraint(equalTo: topAnchor),
            secureTextField.bottomAnchor.constraint(equalTo: bottomAnchor),
            secureTextField.leadingAnchor.constraint(equalTo: leadingAnchor),
            secureTextField.trailingAnchor.constraint(equalTo: trailingAnchor)
        ])
        
        // Disable interaction on textfield itself so clicks pass back to the subviews
        secureTextField.isUserInteractionEnabled = false
    }
    
    /// Wraps your core webview inside the iOS hardware security boundary
    func embedContentView(_ contentView: UIView) {
        guard let secureTarget = secureContainerView else {
            // Fallback if UITextField internal layout fails (unlikely)
            addSubview(contentView)
            return
        }
        
        secureTarget.isUserInteractionEnabled = true
        secureTarget.addSubview(contentView)
        
        contentView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            contentView.topAnchor.constraint(equalTo: secureTarget.topAnchor),
            contentView.bottomAnchor.constraint(equalTo: secureTarget.bottomAnchor),
            contentView.leadingAnchor.constraint(equalTo: secureTarget.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: secureTarget.trailingAnchor)
        ])
    }
}
```

### Wrapping your WebView inside `ViewController.swift`

```swift
import UIKit
import WebKit

class ViewController: UIViewController {

    private var secureContainer: SecureContentViewContainer!
    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        
        // 1. Initialize our security containment layer
        secureContainer = SecureContentViewContainer(frame: view.bounds)
        secureContainer.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(secureContainer)
        
        // 2. Create the webview layer
        let config = WKWebViewConfiguration()
        webView = WKWebView(frame: secureContainer.bounds, configuration: config)
        
        // 3. Mount the webview directly inside the native physical secure textfield hack view
        secureContainer.embedContentView(webView)
        
        // 4. Load your study platform frontend URL
        if let targetUrl = URL(string: "https://yourplatform.com") {
            let request = URLRequest(url: targetUrl)
            webView.load(request)
        }
    }
}
```

---

## 4. WebView / Mini App Bridge Integration

You can control screenshot protection dynamically from the web frontend (React) by using a Javascript-to-Native bridge. This is highly useful when you only want to enforce blocks on premium course material screens but allow standard sharing on standard landing pages.

### Method: Dynamic native message receiver and toggles

#### Web Frontend Side (React App): `/src/lib/mobileBridge.ts`

```typescript
export interface WebBridge {
  postMessage: (message: any) => void;
}

// Safely obtain native bridges depending on platforms
const getNativeBridge = (): { isNative: boolean; setWindowSecure: (enable: boolean) => void } => {
  const isAndroid = (window as any).AndroidSecurityBridge !== undefined;
  const isIOS = (window as any).webkit?.messageHandlers?.securityBridge !== undefined;

  return {
    isNative: isAndroid || isIOS,
    setWindowSecure: (enable: boolean) => {
      const command = { action: "setWindowSecure", value: enable };
      
      if (isAndroid) {
        (window as any).AndroidSecurityBridge.postMessage(JSON.stringify(command));
      } else if (isIOS) {
        (window as any).webkit.messageHandlers.securityBridge.postMessage(command);
      } else {
        console.warn("🔒 Security Signal Attempted on Non-Native Client View", { enable });
      }
    }
  };
};

export const mobileBridge = getNativeBridge();
```

#### Android Native Receiver (`MainActivity.kt`)

Register an interface on the web view:

```kotlin
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

class AndroidSecurityBridge(private val activity: MainActivity, private val webView: WebView) {
    
    @JavascriptInterface
    fun postMessage(valString: String) {
        try {
            val json = JSONObject(valString)
            val action = json.optString("action")
            val value = json.optBoolean("value")
            
            if (action == "setWindowSecure") {
                activity.runOnUiThread {
                    if (value) {
                        activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
                    } else {
                        activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

// Inside your webview initialization:
myWebView.addJavascriptInterface(AndroidSecurityBridge(this, myWebView), "AndroidSecurityBridge")
```

#### iOS Native Receiver (`ViewController.swift`)

Observe messages over `WKScriptMessageHandler`:

```swift
import WebKit

class ViewController: UIViewController, WKScriptMessageHandler {

    private var secureContainer: SecureContentViewContainer!
    // Maintain standard input fallback references if switching protection states dynamically

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "securityBridge",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }
        
        if action == "setWindowSecure" {
            let enableSecurity = body["value"] as? Bool ?? false
            updateiOSWindowSecurity(enable: enableSecurity)
        }
    }
}
```
