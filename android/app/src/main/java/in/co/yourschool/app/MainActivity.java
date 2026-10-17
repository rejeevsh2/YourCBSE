package in.co.yourschool.app;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register before BridgeActivity creates the native bridge.
        registerPlugin(ImmersivePresentationPlugin.class);
        super.onCreate(savedInstanceState);
        // Capacitor's SystemBars listener handles visible bars and cutout insets.
        EdgeToEdge.enable(this);
    }
}
