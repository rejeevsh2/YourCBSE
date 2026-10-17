package in.co.yourschool.app;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.widget.FrameLayout;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;

/** Preserves Capacitor's normal dialogs/file chooser and adds HTML video fullscreen. */
public class VideoWebChromeClient extends BridgeWebChromeClient {
    private final Bridge appBridge;
    private FrameLayout fullscreenHost;
    private WebChromeClient.CustomViewCallback fullscreenCallback;
    private boolean statusVisible, navigationVisible, captionVisible, lightStatus, lightNavigation, keptScreenOn;
    private int previousBehavior;
    private Drawable previousBackground;

    public VideoWebChromeClient(Bridge bridge) {
        super(bridge);
        appBridge = bridge;
    }

    private View decor() { return appBridge.getActivity().getWindow().getDecorView(); }

    private WindowInsetsControllerCompat bars() {
        return WindowCompat.getInsetsController(appBridge.getActivity().getWindow(), decor());
    }

    @Override
    public void onShowCustomView(View view, WebChromeClient.CustomViewCallback callback) {
        if (fullscreenHost != null) { callback.onCustomViewHidden(); return; }
        WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(decor());
        WindowInsetsControllerCompat controller = bars();
        statusVisible = insets == null || insets.isVisible(WindowInsetsCompat.Type.statusBars());
        navigationVisible = insets == null || insets.isVisible(WindowInsetsCompat.Type.navigationBars());
        captionVisible = insets == null || insets.isVisible(WindowInsetsCompat.Type.captionBar());
        lightStatus = controller.isAppearanceLightStatusBars();
        lightNavigation = controller.isAppearanceLightNavigationBars();
        previousBehavior = controller.getSystemBarsBehavior();
        previousBackground = decor().getBackground();
        keptScreenOn = (appBridge.getActivity().getWindow().getAttributes().flags & WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) != 0;
        fullscreenCallback = callback;
        fullscreenHost = new FrameLayout(appBridge.getContext());
        fullscreenHost.setBackgroundColor(Color.BLACK);
        fullscreenHost.addView(view, new FrameLayout.LayoutParams(-1, -1));
        ViewCompat.setOnApplyWindowInsetsListener(fullscreenHost, (host, windowInsets) -> {
            Insets cutout = windowInsets.getInsets(WindowInsetsCompat.Type.displayCutout());
            host.setPadding(cutout.left, cutout.top, cutout.right, cutout.bottom);
            return windowInsets;
        });
        ((ViewGroup) decor()).addView(fullscreenHost, new ViewGroup.LayoutParams(-1, -1));
        appBridge.getWebView().setVisibility(View.INVISIBLE);
        appBridge.getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        reapplyFullscreen();
    }

    public void reapplyFullscreen() {
        if (fullscreenHost == null) return;
        WindowInsetsControllerCompat controller = bars();
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.setAppearanceLightStatusBars(false);
        controller.setAppearanceLightNavigationBars(false);
        controller.hide(WindowInsetsCompat.Type.systemBars());
        decor().setBackground(new ColorDrawable(Color.BLACK));
        ViewCompat.requestApplyInsets(fullscreenHost);
    }

    public boolean exitFullscreen() {
        if (fullscreenHost == null) return false;
        onHideCustomView();
        return true;
    }

    @Override
    public void onHideCustomView() {
        if (fullscreenHost == null) return;
        FrameLayout host = fullscreenHost;
        WebChromeClient.CustomViewCallback callback = fullscreenCallback;
        fullscreenHost = null;
        fullscreenCallback = null;
        ((ViewGroup) decor()).removeView(host);
        host.removeAllViews();
        appBridge.getWebView().setVisibility(View.VISIBLE);
        if (!keptScreenOn) appBridge.getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        WindowInsetsControllerCompat controller = bars();
        controller.setSystemBarsBehavior(previousBehavior);
        controller.setAppearanceLightStatusBars(lightStatus);
        controller.setAppearanceLightNavigationBars(lightNavigation);
        restoreBar(WindowInsetsCompat.Type.statusBars(), statusVisible);
        restoreBar(WindowInsetsCompat.Type.navigationBars(), navigationVisible);
        restoreBar(WindowInsetsCompat.Type.captionBar(), captionVisible);
        decor().setBackground(previousBackground);
        ViewCompat.requestApplyInsets(decor());
        if (callback != null) callback.onCustomViewHidden();
    }

    private void restoreBar(int type, boolean visible) {
        if (visible) bars().show(type); else bars().hide(type);
    }
}
