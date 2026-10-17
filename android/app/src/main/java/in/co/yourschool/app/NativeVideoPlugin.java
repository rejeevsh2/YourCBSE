package in.co.yourschool.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeVideo")
public class NativeVideoPlugin extends Plugin {
    @PluginMethod
    public void exitFullscreen(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            boolean exited = ((MainActivity) getActivity()).exitVideoFullscreen();
            JSObject result = new JSObject();
            result.put("exited", exited);
            call.resolve(result);
        });
    }
}
