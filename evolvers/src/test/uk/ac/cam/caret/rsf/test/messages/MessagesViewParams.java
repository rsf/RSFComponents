/*
 * Created on 29 Mar 2008
 */
package uk.ac.cam.caret.rsf.test.messages;

import uk.org.ponder.rsf.bare.RequestLauncher;
import uk.org.ponder.rsf.evolvers.FormatAwareDateInputEvolver;
import uk.org.ponder.rsf.viewstate.SimpleViewParameters;

public class MessagesViewParams extends SimpleViewParameters {
  public String invalidDateKey;
  public String invalidTimeKey;
  public String inputStyle = FormatAwareDateInputEvolver.DATE_INPUT;
  public int numfields = 1;
  public MessagesViewParams() {
    viewID = RequestLauncher.TEST_VIEW;
  }
}
