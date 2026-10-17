package in.co.yourschool.app;

import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.ColorDrawable;
import android.view.View;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ImmersivePresentation")
public class ImmersivePresentationPlugin extends Plugin {
    private boolean enabled;
    private boolean statusWasVisible;
    private boolean navigationWasVisible;
    private boolean captionWasVisible;
    private boolean lightStatusBar;
    private boolean lightNavigationBar;
    private int previousBehavior;
    private Drawable previousBackground;

    private WindowInsetsControllerCompat controller() {
        return WindowCompat.getInsetsController(getActivity().getWindow(), getActivity().getWindow().getDecorView());
    }

    @PluginMethod
    public void setEnabled(PluginCall call) {
        boolean requested = call.getBoolean("enabled", false);
        getBridge().executeOnMainThread(() -> {
            View decor = getActivity().getWindow().getDecorView();
            WindowInsetsControllerCompat bars = controller();
            if (requested) {
                if (!enabled) {
                    WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(decor);
                    statusWasVisible = insets == null || insets.isVisible(WindowInsetsCompat.Type.statusBars());
                    navigationWasVisible = insets == null || insets.isVisible(WindowInsetsCompat.Type.navigationBars());
                    captionWasVisible = insets == null || insets.isVisible(WindowInsetsCompat.Type.captionBar());
                    previousBehavior = bars.getSystemBarsBehavior();
                    lightStatusBar = bars.isAppearanceLightStatusBars();
                    lightNavigationBar = bars.isAppearanceLightNavigationBars();
                    previousBackground = decor.getBackground();
                }
                enabled = true;
                applyImmersiveMode();
            } else if (enabled) {
                enabled = false;
                bars.setSystemBarsBehavior(previousBehavior);
                bars.setAppearanceLightStatusBars(lightStatusBar);
                bars.setAppearanceLightNavigationBars(lightNavigationBar);
                if (statusWasVisible) bars.show(WindowInsetsCompat.Type.statusBars());
                else bars.hide(WindowInsetsCompat.Type.statusBars());
                if (navigationWasVisible) bars.show(WindowInsetsCompat.Type.navigationBars());
                else bars.hide(WindowInsetsCompat.Type.navigationBars());
                if (captionWasVisible) bars.show(WindowInsetsCompat.Type.captionBar());
                else bars.hide(WindowInsetsCompat.Type.captionBar());
                decor.setBackground(previousBackground);
                ViewCompat.requestApplyInsets(decor);
            }
            call.resolve();
        });
    }

    private void applyImmersiveMode() {
        if (!enabled) return;
        View decor = getActivity().getWindow().getDecorView();
        WindowInsetsControllerCompat bars = controller();
        bars.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        bars.setAppearanceLightStatusBars(false);
        bars.setAppearanceLightNavigationBars(false);
        bars.hide(WindowInsetsCompat.Type.systemBars());
        // Replace the drawable rather than mutating the saved background.
        decor.setBackground(new ColorDrawable(Color.BLACK));
        ViewCompat.requestApplyInsets(decor);
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (enabled) getActivity().getWindow().getDecorView().post(this::applyImmersiveMode);
    }

    @Override
    protected void handleOnConfigurationChanged(Configuration configuration) {
        super.handleOnConfigurationChanged(configuration);
        // Run after Capacitor updates its normal system-bar styling on rotation.
        if (enabled) getActivity().getWindow().getDecorView().post(this::applyImmersiveMode);
    }
}
