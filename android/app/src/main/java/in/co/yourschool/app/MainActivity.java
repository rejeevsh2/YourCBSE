package in.co.yourschool.app;

import android.os.Bundle;
import android.content.res.Configuration;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private VideoWebChromeClient videoChromeClient;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register before BridgeActivity creates the native bridge.
        registerPlugin(ImmersivePresentationPlugin.class);
        registerPlugin(NativeVideoPlugin.class);
        super.onCreate(savedInstanceState);
        // Capacitor's SystemBars listener handles visible bars and cutout insets.
        EdgeToEdge.enable(this);
        if (bridge != null) {
            bridge.setWebViewClient(new YouTubeWebViewClient(bridge));
            videoChromeClient = new VideoWebChromeClient(bridge);
            bridge.getWebView().setWebChromeClient(videoChromeClient);
        }
    }

    public boolean exitVideoFullscreen() {
        return videoChromeClient != null && videoChromeClient.exitFullscreen();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (videoChromeClient != null) getWindow().getDecorView().post(videoChromeClient::reapplyFullscreen);
    }

    @Override
    public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        if (videoChromeClient != null) getWindow().getDecorView().post(videoChromeClient::reapplyFullscreen);
    }

    @Override
    public void onDestroy() {
        exitVideoFullscreen();
        super.onDestroy();
    }
}
