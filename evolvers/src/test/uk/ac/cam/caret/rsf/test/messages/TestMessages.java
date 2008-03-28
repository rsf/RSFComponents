/*
 * Created on 8 Jan 2008
 */
package uk.ac.cam.caret.rsf.test.messages;

import java.util.Date;
import java.util.GregorianCalendar;

import uk.org.ponder.messageutil.TargettedMessage;
import uk.org.ponder.messageutil.TargettedMessageList;
import uk.org.ponder.rsf.bare.ActionResponse;
import uk.org.ponder.rsf.bare.RenderResponse;
import uk.org.ponder.rsf.bare.junit.MultipleRSFTests;
import uk.org.ponder.rsf.components.UIForm;
import uk.org.ponder.rsf.components.UIInput;

/** Test for message propagation issues, and date input infrastructure
 */

public class TestMessages extends MultipleRSFTests {
  
  public TestMessages() {
    contributeRequestConfigLocation("conf/components-requestContext.xml");
    contributeConfigLocation("conf/components-applicationContext.xml");
    contributeRequestConfigLocation("classpath:uk/ac/cam/caret/rsf/test/messages/messages-request-context.xml");
    contributeConfigLocation("classpath:uk/ac/cam/caret/rsf/test/messages/messages-application-context.xml");
  }
  
  public void testSubmit(String value, Date expected) {
    RenderResponse render = getRequestLauncher().renderView();
    UIForm form = (UIForm) render.viewWrapper.queryComponent(new UIForm());
    UIInput dateInput = (UIInput) render.viewWrapper.queryComponent(new UIInput());
    
    dateInput.updateValue(value);
    
    ActionResponse response = getRequestLauncher().submitForm(form, null);
    assertActionError(response, expected == null);

    DateHolder holder = (DateHolder) response.requestContext.locateBean("dateHolder");
    
    assertEquals(expected, holder.date);
    
    if (expected == null) {
      TargettedMessageList tml = (TargettedMessageList) response.requestContext.locateBean("targettedMessageList");
      assertEquals(1, tml.size());
      TargettedMessage tm = tml.messageAt(0);
      assertEquals(tm.targetid, dateInput.getFullID());
    }
  }
  
  public void testMessages() {

    testSubmit("05/12/05", new GregorianCalendar(2005, 11, 05).getTime());
    testSubmit("/////", null);
  }
}
