package uk.ac.cam.caret.rsf.renderutil;

/* This is a bean that contains the standard things
 * you usually want to filter a standard table. Including
 * fields for the pager, filter, and sort column.
 * 
 * This is a Fat Pea.
 */
public class TableOptions {
  public static final String SHOWALL = "showall";
  public static final String LASTPAGE = "lastpage";
  public static final String SORTASC = "asc";
  public static final String SORTDSC = "dsc";
  
  public String pagenum = "";
  public String pagesize = "";
  public String filter = "";
  public String sortby = "";
  public String sortdir = "";
  
  public String toString() {
    return "Pagenum: " + pagenum + " Pagesize: " + pagesize + " Filter: " + filter + " Sortby: " + sortby + " Sortdir: " + sortdir;
  }
  
  public TableOptions() {}
  
  public TableOptions(int pagenum, int pagesize, String filter, String sortby, boolean sortasc) {
    this.updateCurrentPage(pagenum);
    this.updateItemsPerPage(pagesize);
    this.updateFilterText(filter);
    this.updateSortColumn(sortby);
    this.updateSortDirection(sortasc);
  }
  
  /*
   * This method returns true if all the fields are either
   * null or empty strings, meaning that this probably came in
   * as a new view, and you will want to set it up with the
   * default settings for your application's table;
   */
  public boolean isInitialized() {
    if ((pagenum == null || pagenum.equals("")) &&
        (pagesize == null || pagesize.equals("")) &&
        (filter == null || filter.equals("")) &&
        (sortby == null || sortby.equals("")) &&
        (sortdir == null || sortdir.equals("")))
      return false;
    else
      return true;
  }
  
  /* This gets the search filter text. It may return
   * null if there is none or it's empty.  Also, it
   * checks for fillerText and will return null if it
   * matches.
   * 
   * This is so you can populate search boxes with things
   * like, "Click here to enter search terms" or something.
   * 
   */
  public String acquireFilterText(String fillerText) {
    String filtertext = filter != null 
    && !filter.equals(fillerText)  ? filter : null;
    return filtertext;
  }
  
  public void updateFilterText(String text) {
    filter = text;
  }
  
  /* Returns the search column.  If there are any problems
   * or one isn't specified, the default column identifier 
   * you pass in is returned.
   * 
   */
  public String acquireSortColumn(String defaultColumn) {
    String column = sortby == null || sortby.equals("") ? defaultColumn : sortby;
    return column;
  }
  
  public String acquireSortColumn() {
    return sortby;
  }
  
  public void updateSortColumn(String column) {
    sortby = column;
  }
  
  /* Returns the sort direction. A true value indicates ascending,
   * false inidcates descending. You pass in the default sort value.
   * The default will be returned if there are any uncertanies in 
   * the value that came in.
   * 
   */
  public boolean acquireSortDirection(boolean defaultSort) {
    //boolean columndir = sortdir != null && sortdir.equals("asc") ? false : true;
    if (sortdir != null && sortdir.equals("asc"))
      return true;
    else if (sortdir != null && sortdir.equals("dsc"))
      return false;
    else
      return defaultSort;
  }
  
  public boolean acquireSortDirection() {
    return acquireSortDirection(true);
  }
  
  public void updateSortDirection(boolean isascending) {
    if (isascending)
      sortdir = "asc";
    else 
      sortdir = "dsc";
  }
  
  /* Returns the total number of items to be shown on
   * each page. Any value below zero indicated show all
   * items.
   */
  public int acquirePageSize(int defaultSize) {
    try {
      if (pagesize == null || pagesize.equals("")) 
        return defaultSize;
      else if (pagesize.equals(SHOWALL))
        return -1;
      else {
        int size = Integer.parseInt(pagesize);
        return size;
      } 
    }
    catch (NumberFormatException nfe) {
      return defaultSize;
    }
  }
  
  public void updateItemsPerPage(int size) {
    if (size < 0)
      pagesize = SHOWALL;
    else
      pagesize = size+"";
  }
  
  /* Returns the current page. Any value below zero
   * is considered to be the last page of however
   * many pages there are.
   * 
   * Because we are operating in a stateless environment
   * the number of pages could have increased between 
   * requests, which is why we have the special case that
   * always indicates 'last page'. 
   * 
   * If there are any problems with the stored string 0
   * is returned.
   * 
   * We count like CompScientists, the first page is 0.
   */
  public int acquireCurrentPage() {
    try {
      if (pagenum == null || pagenum.equals(""))
        return 0;
      else if (pagenum.equals(LASTPAGE))
        return -1;
      else
        return Integer.parseInt(pagenum);
    }
    catch(NumberFormatException nfr) {
      return 0;
    }
  }
  
  public void updateCurrentPage(int curpage) {
    if (curpage < 0)
      pagenum = LASTPAGE;
    else
      pagenum = curpage+"";
  }
  
}
