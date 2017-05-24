/* This should make card in the error container that demonstrates more information about the error. */
function createTextButton( feedbackItem, options )
{
    console.log(JSON.stringify(feedbackItem));
    options = options || {};
    var buttonStr = "<a"
                        + " data-feedback=\'" +  options.data  + "'"
                        + " data-html=\"true\""
                        + " popover-trigger=\"'outsideClick'\""
                        + " ng-click=\"setSelectedItem( $event )\""
                        + " uib-popover-template=" + ( options['template-file'] || "\"'components/Feedback/popoverMini.html'\"" )
                        + " popover-animation=" + (options['animation'] || "\"true\"" )
                        + " popover-placement=" + (options['placement'] || "\"bottom\"" )
                        + " class=\" btnText nocode " + ( options['classes']  + " " ||  "")  +  "\""
                        + ">";
    var endButton = "</a>";
    var result = { 'start': buttonStr,
                    'mid': feedbackItem.target,
                    'end': endButton
                };
    return result;
}

module.exports.createTextButton = createTextButton;
