package in.co.yourschool.app;

import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/** Serves only the player wrapper at an isolated HTTPS app-identity origin. */
public class YouTubeWebViewClient extends BridgeWebViewClient {
    private final Bridge appBridge;

    public YouTubeWebViewClient(Bridge bridge) {
        super(bridge);
        appBridge = bridge;
    }

    private boolean isPlayerOrigin(Uri uri) {
        return "https".equals(uri.getScheme())
            && appBridge.getContext().getPackageName().equals(uri.getHost())
            && uri.getPort() == -1 && uri.getUserInfo() == null;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (isPlayerOrigin(request.getUrl())) {
            if ("/youtube-player.html".equals(request.getUrl().getPath()) && "GET".equals(request.getMethod())) {
                try {
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Referrer-Policy", "strict-origin-when-cross-origin");
                    headers.put("Cache-Control", "no-store");
                    headers.put("X-Content-Type-Options", "nosniff");
                    return new WebResourceResponse("text/html", "UTF-8", 200, "OK", headers,
                        appBridge.getContext().getAssets().open("youtube-player.html"));
                } catch (IOException ignored) {
                    // Do not try the network for this local-only origin.
                }
            }
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null,
                new ByteArrayInputStream(new byte[0]));
        }
        return super.shouldInterceptRequest(view, request);
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        // Keep HTTPS subframes embedded. Capacitor's default sends foreign
        // frame navigations to another app. Top-level links still use Capacitor.
        if (!request.isForMainFrame() && "https".equals(request.getUrl().getScheme())) return false;
        if (isPlayerOrigin(request.getUrl())) return true;
        return super.shouldOverrideUrlLoading(view, request);
    }
}
