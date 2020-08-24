var helper = require('./testcafeHtmlHelper.js');

module.exports = function htmlContent(reportObject) {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>My Account Test Report</title>
            <link rel="stylesheet" href="./testcafeReport.css">
        </head>
        <body>

            <table class="reportSummary">
                <thead>
                    <tr>
                        <th>User Agent</th>
                        <th><button class="filterBtn" id="total">Total</button></th>
                        <th><button class="filterBtn" id="passed">Passed</button></th>
                        <th><button class="filterBtn" id="failed">Failed</button></th>
                        <th><button class="filterBtn" id="skipped">Skipped</button></th>
                        <th>Execution Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${reportObject.userAgents}</td>
                        <td>${reportObject.total}</td>
                        <td>${reportObject.passed}</td>
                        <td>${reportObject.total - reportObject.passed}</td>
                        <td>${reportObject.skipped}</td>
                        <td>${((Date.parse(reportObject.endTime) - Date.parse(reportObject.startTime)) / 60000).toFixed(2)} minutes</td>
                    </tr>
                </tbody>
            </table>
            <table class="legendTable">
                <tr>
                    <td>Fixtures: ${symbols.fixtures}</td>
                    <td>Tests: ${symbols.tests}</td>
                    <td>Browser Logs: ${symbols.browserLogs}</td>
                    <td>Http Requests: ${symbols.httpRequests}</td>
                    <td>Test Info: ${symbols.testInfo}</td>
                </tr>
            </table>

            ${expandAndCollapseButtons}

            ${helper.flushFixtures(reportObject.fixtures)}

            ${expandAndCollapseButtons}

            <!-- The Modal -->
            <div id="myModal" class="modal">

                <!-- The Close Button -->
                <span class="close">&times;</span>

                <!-- Modal Content (The Image) -->
                <img class="modal-content" id="img01">

                <!-- Modal Caption (Image Text) -->
                <div id="caption"></div>
            </div>

            <script type="text/javascript">

            var acc = document.getElementsByClassName("accordian");
            var failed = document.getElementsByName("fixture-Failed");
            var expandAll = document.getElementsByName("expand");
            var collapseAll = document.getElementsByName("collapse");
            var failedFixtures = document.getElementsByName("expand-fixtures-Failed");
            var filterFail = document.getElementById("failed")
            var filterPassed = document.getElementById("passed")
            var filterSkipped = document.getElementById("skipped")
            var filterTotal = document.getElementById("total");
            var trs = document.getElementsByClassName("result-rows");
            var failedTrs= document.getElementsByClassName("failed-testrows");

            // Click on Individual accordian to expand and collapse
            for (var i = 0; i < acc.length; i++) {
                acc[i].addEventListener("click", function () {
                    this.classList.toggle("active");
                    var panel = this.nextElementSibling;
                    var testRow = this.nextElementSibling.nextElementSibling;
                    if (panel.style.display === "block") {
                        panel.style.display = "none";
                        testRow.style.display = "none";
                    } else {
                        panel.style.display = "block";
                        testRow.style.display = "table";
                    }
                });
            }

            // Click on Expand All Buttons to expand all the accordians
            for (var i = 0; i < expandAll.length; i++) {
                expandAll[i].addEventListener("click", function () {
                    for (var j = 0; j < acc.length; j++) {
                        acc[j].nextElementSibling.style.display = "block";
                        acc[j].nextElementSibling.nextElementSibling.style.display = "table";
                    }
                    for (var k = 0; k < trs.length; k++) {
                        trs[k].style.display = "table-row";
                    }
                });
            }

            // Click on Collapse All Buttons to collapse all the accordians
            for (var i = 0; i < collapseAll.length; i++) {
                collapseAll[i].addEventListener("click", function () {
                    for (var j = 0; j < acc.length; j++) {
                        acc[j].nextElementSibling.style.display = "none";
                        acc[j].nextElementSibling.nextElementSibling.style.display = "none";
                    }
                    for (var k = 0; k < trs.length; k++) {
                        trs[k].style.display = "none";
                    }
                });
            }

            // Click on Expand Failed Fixturesbutton to expand only the failed fixtures
            for (var i = 0; i < failedFixtures.length; i++) {
                failedFixtures[i].addEventListener("click", function () {
                    for (var j = 0; j < acc.length; j++) {
                        if(failed[j]){
                            failed[j].nextElementSibling.style.display = "block";
                            failed[j].nextElementSibling.nextElementSibling.style.display = "table";
                        }

                    }
                    for (var k = 0; k < failedTrs.length; k++) {
                        failedTrs[k].style.display = "table-row";
                    }
                });
            }



            // Show only Failed Fixtures and Hide the rest
            filterFail.addEventListener("click", function () {
                for (var i = 0; i < acc.length; i++) {
                    changeDisplay(acc[i],"fixture-Failed");
                }
            });

            // Show only Passed Fixtures and Hide the rest
            filterPassed.addEventListener("click", function() {
                for(var i = 0; i < acc.length; i++) {
                    changeDisplay(acc[i],"fixture-Passed");
                }
            });

            // Show only Skipped Fixtures and Hide the rest
            filterSkipped.addEventListener("click", function() {
                for(var i = 0; i < acc.length; i++) {
                    changeDisplay(acc[i],"fixture-Skipped");
                }
            });

            // Clear all Filters
            filterTotal.addEventListener("click", function() {
                for(var i = 0; i < acc.length; i++) {
                    acc[i].style.display="block" ;
                }
            });

            function changeDisplay(element,fixtureType){
                if(element.getAttribute("name")==fixtureType ) {
                        element.style.display="block" ;
                }
                else{
                    element.style.display="none";
                }
            }

            //Adding event handler against each header rows for accordian functionality
            var tbodies = document.getElementsByClassName("test-tbody");
            for (i = 0; i < tbodies.length; i++) {
                var tbody= tbodies[i];
                var id=tbody.id;
                var thead=tbody.children[0];
                thead.addEventListener("click", function(event){
                    var targetElement = event.target || event.srcElement;
                });
            }


            // Get the modal
            var modal = document.getElementById("myModal");

            // Get the image and insert it inside the modal - use its "alt" text as a caption
            var body = document.getElementsByTagName("body")
            var imgs = body[0].querySelectorAll("img");

            var modalImg = document.getElementById("img01");
            for (i = 0; i < imgs.length-1; i++) {
                var img=imgs[i];
                img.onclick = function(){
                    modal.style.display = "block";
                    modalImg.src = this.src;
                }
            }

            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("close")[0];

            // When the user clicks on <span> (x), close the modal
            span.onclick = function() {
                modal.style.display = "none";
            }

            </script>
        </body>
    </html>
    `;
};

const expandAndCollapseButtons = `
    <button class="toggle-all" name="expand">EXPAND ALL</button>
    <button class="toggle-all" name="collapse">COLLAPSE ALL</button>
    <button class="toggle-all" name="expand-fixtures-Failed">EXPAND FAILED FIXTURES</button>
`;

const symbols = {
    fixtures: '&#128301;',
    tests: '&#127776;',
    browserLogs: '&#128187;',
    httpRequests: '&#128376;',
    testInfo: '&#128712;',
    greenTick: '&#9989;',
    redCross: '&#10060;',
    slashChar: '&#92;'
};
