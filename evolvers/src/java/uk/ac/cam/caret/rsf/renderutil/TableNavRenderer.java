package uk.ac.cam.caret.rsf.renderutil;

import uk.ac.cam.caret.rsf.renderutil.TableOptions;
import uk.org.ponder.htmlutil.HTMLUtil;
import uk.org.ponder.rsf.components.UIContainer;
import uk.org.ponder.rsf.components.UIForm;
import uk.org.ponder.rsf.components.UIInput;
import uk.org.ponder.rsf.components.UIJointContainer;
import uk.org.ponder.rsf.components.UIOutput;
import uk.org.ponder.rsf.components.UISelect;
import uk.org.ponder.rsf.components.UIVerbatim;
import uk.org.ponder.rsf.components.decorators.DecoratorList;
import uk.org.ponder.rsf.components.decorators.UIDisabledDecorator;
import uk.org.ponder.rsf.viewstate.ViewParameters;

/* This class contains the methods necessary for constructing sortable headers, a pager,
 * and a search box for a table, as well as a GET form to aggregate the parameters for 
 * submission.
 * 
 * This class is not to be a singleton. You need a seperate instance of it for each table
 * you are going to render.
 * 
 */
public class TableNavRenderer {
  public UIForm parameterForm;
  public UIVerbatim jscript;
  
  private int numHeaders = 0;
  private StringBuilder js = new StringBuilder();
  
  public TableNavRenderer(UIContainer tofill, String formID, String scriptID, ViewParameters vparams) 
  {
    parameterForm = UIForm.make(tofill, formID, vparams);
    jscript = UIVerbatim.make(tofill, scriptID, "");
    jscript.markup = new StringBuilder();  
    appendJS("theform = new SakaiProject.TableRenderer('"+parameterForm.getFullID()+"');");
  }
  
  protected void appendJS(String script) {
    StringBuilder sb = (StringBuilder) jscript.markup;
    sb.append(script);
  }
  
  public void makePager(UIContainer tofill, String divID, TableOptions options, int totalsize) {
    UIJointContainer joint = new UIJointContainer(tofill, divID, "standard-sakai-pager:", numHeaders+"");
    UIOutput.make(joint, "instructions:", "Viewing x to y of "+totalsize);
    
    String[] values = new String[] { "5", "10", "20", "50", "100", "200" };
    String[] labels = new String[] { "Show 5", "Show 10", "Show 20", "Show 50", "Show 100", "Show 200" };
    
    UISelect.make(joint, "num-pages-select", values, labels, options.acquirePageSize(20)+"", false);
    
    UIOutput firstPageButton = UIOutput.make(joint, "first-page-button");
    UIOutput prevPageButton = UIOutput.make(joint, "prev-page-button");
    UIOutput nextPageButton = UIOutput.make(joint, "next-page-button");
    UIOutput lastPageButton = UIOutput.make(joint, "last-page-button");
    
    if (options.acquireCurrentPage() == 0) {
      firstPageButton.decorators = new DecoratorList(new UIDisabledDecorator());
      prevPageButton.decorators = new DecoratorList(new UIDisabledDecorator());
    }
    else if (options.acquireCurrentPage() < 0) {
      nextPageButton.decorators = new DecoratorList(new UIDisabledDecorator());
      lastPageButton.decorators = new DecoratorList(new UIDisabledDecorator());
    }
    appendJS(HTMLUtil.emitJavascriptCall("theform.addSakaiPager", new String[] {joint.getFullID(), options.acquireCurrentPage()+"", options.acquirePageSize(20)+""}));
    numHeaders++;
  }
  
  public void makeSearchFilter(UIContainer tofill, String divID, String startingText) {
    UIJointContainer joint = new UIJointContainer(tofill, divID, "search-filter:", numHeaders+"");
    UIInput.make(joint, "search-text-input", null, startingText);
    UIOutput.make(joint, "find-button");
    UIOutput.make(joint, "clear-button");
    appendJS(HTMLUtil.emitJavascriptCall("theform.addSearchFilter", new String[] {joint.getFullID(),startingText}));
    numHeaders++;
  }
  
  public void makeSortableHeader(UIContainer tofill, String thID, String linktext, String sortid) {
    UIJointContainer joint = new UIJointContainer(tofill, thID, "theader:sort-link", numHeaders+"");
    UIOutput sortlink = UIOutput.make(joint, "sort-link", linktext );
    appendJS(HTMLUtil.emitJavascriptCall("theform.addSortableHeader", new String[] {joint.getFullID(), sortid, "asc"}));
    numHeaders++;
  }
  
  public void makeSortedHeader(UIContainer tofill, String thId, String linktext, String sortid, boolean curascending) {
    String newsortdir = curascending ? "asc" : "dsc";
    String cursortdir = curascending ? "dsc" : "asc";
    UIJointContainer joint;
    if (curascending)
      joint = new UIJointContainer(tofill, thId, "theader:cursort-asc-link", numHeaders+"");
    else
      joint = new UIJointContainer(tofill, thId, "theader:cursort-dsc-link", numHeaders+"");
    UIOutput sortlink = UIOutput.make(joint, "sort-link");
    UIOutput.make(joint, "link-text", linktext);
    appendJS(HTMLUtil.emitJavascriptCall("theform.addSortedHeader", new String[] {joint.getFullID(), sortid, cursortdir, newsortdir}));
    numHeaders++;
  }
  
  public void makeSortingHeader(UIContainer tofill, String thID, String linktext, String sortid, TableOptions tableoptions) {
    if (tableoptions.acquireSortColumn().equals(sortid)) {
      makeSortedHeader(tofill, thID, linktext, sortid, !tableoptions.acquireSortDirection());
    }
    else {
      makeSortableHeader(tofill, thID, linktext, sortid);
    }
  }
  
}
