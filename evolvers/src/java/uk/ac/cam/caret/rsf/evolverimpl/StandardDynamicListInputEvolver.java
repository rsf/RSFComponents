/*
 * Created on 6 Mar 2007
 */
package uk.ac.cam.caret.rsf.evolverimpl;

import uk.org.ponder.beanutil.BeanGetter;
import uk.org.ponder.htmlutil.HTMLUtil;
import uk.org.ponder.rsf.components.UIBasicListMember;
import uk.org.ponder.rsf.components.UIBoundString;
import uk.org.ponder.rsf.components.UIBranchContainer;
import uk.org.ponder.rsf.components.UIInputMany;
import uk.org.ponder.rsf.components.UIJointContainer;
import uk.org.ponder.rsf.components.UIOutput;
import uk.org.ponder.rsf.components.UIVerbatim;
import uk.org.ponder.rsf.evolvers.DynamicListInputEvolver;

public class StandardDynamicListInputEvolver implements DynamicListInputEvolver {

  public static final String COMPONENT_ID = "dynamic-list-input:";
  public static final String CORE_ID = "dynamic-list-input-core:";
  
  private BeanGetter rbg;
  private UIBoundString removelabel;
  private UIBoundString addlabel;

  public void setRequestBeanGetter(BeanGetter rbg) {
    this.rbg = rbg;
  }
  
  public UIJointContainer evolve(UIInputMany toevolve) {
    UIJointContainer togo = new UIJointContainer(toevolve.parent, toevolve.ID, 
        COMPONENT_ID);
    toevolve.parent.remove(toevolve);
    toevolve.ID = "list-control";
    togo.addComponent(toevolve);
    
    String[] value = toevolve.getValue();
    if (value == null) {
      value = (String[]) rbg.getBean(toevolve.valuebinding.value);
      // May as well save on later fixups
      toevolve.setValue(value);
    }
    UIBranchContainer core = UIBranchContainer.make(togo, CORE_ID);
    for (int i = 0; i < value.length; ++ i) {
      UIBranchContainer row = UIBranchContainer.make(core, 
          "dynamic-list-input-row:", Integer.toString(i));
      UIOutput.make(row, "input", value[i]);
      UIBasicListMember.makeBasic(row, "input", toevolve.getFullID(), i);
      UIOutput.make(row, "remove", removelabel.getValue(), 
          removelabel.valuebinding == null? null : removelabel.valuebinding.value);
    }
    UIOutput.make(core, "add-row", addlabel.getValue(), 
        addlabel.valuebinding == null? null : addlabel.valuebinding.value);
    String script = HTMLUtil.emitJavascriptCall("DynamicListInput.init_DynamicListInput", 
        new String[] {core.getFullID(), Integer.toString(value.length)});
    UIVerbatim.make(togo, "init-script", script);
    return togo;
  }

  public void setLabels(UIBoundString removelabel, UIBoundString addlabel) {
    this.removelabel = removelabel;
    this.addlabel = addlabel;
  }


}
