var cards = [];
var taggedCards = {};
var interactionMode = 'edit';

var practice_quill = null;

/**
 * When create/upload button is clicked,
 *   1. provide options of upload or create new in popup window
 *   2. Initiate card session
 */
$('#start_set').click(function(){


    //Transition button
   $(this).addClass('start_set_left')

    //Create window html
    var window = $("<div></div>").attr('id','select_upload_type_window')

    //Seup exist button for this popup window
    var exitButt = $('<span class="material-icons">cancel</span>').css({
            'position':'absolute',
            'right':'0',
            'top':'0',
            'cursor':'pointer'
    }).click((e)=>{window.hide()})
    .mouseenter((e)=>{e.target.style.color='red';})
    .mouseleave((e)=>{e.target.style.color='grey';})
    window.append(exitButt)
    
    //Create buttons for options and set what they do
    //    
    var new_set_butt = $('<button>Create New</button>').click(()=>{
        cards = [null]
        window.hide()
        setupModeSwitch()
        updateBody();
        
    })
    var upload_set_butt = $('<input type=\'file\' id=\'file_input\'>').change(()=>{
        var fr = new FileReader();
        fr.onload = ()=>{
            cards = JSON.parse(fr.result)
            window.hide() 
            setupModeSwitch()
            updateBody();
        }
        fr.readAsText($('#file_input')[0].files[0])
    })

    window.append(new_set_butt,upload_set_butt)
    $('body').append(window)

}) 


function updateBody()
{
    //Create task buttons
    //Create interaction section
    $('#zone1').html('').append('<div id=\'zone11\'></div>').show()

    
    if (interactionMode == 'edit')
        edit()
    else
    {
        practice()
    }

    //Convert inputs of fields to strings, create file, and download
    $('#export_but_wrapper').show()
    $('#export_but').click(()=>{
        download(JSON.stringify(cards.map(card=>card.map(side=>side.getContents()))), $('#export_filename').val(), 'text/plain')
    })
}

function setupModeSwitch()
{
    var button = $('#start_set').clone().attr('id','modeSwitch').addClass('edit').text('Practice').click(function(){
       
       if (interactionMode=='edit')
       {
            $('#modeSwitch').attr('class','practice').text('Edit')
            interactionMode = 'practice';
            updateBody()
       }
       else
       {
            $('#modeSwitch').attr('class','edit').text('Practice')
            interactionMode = 'edit';
            updateBody()
       }
    })
    $('#zone1').before(button)
}

/* Start edit mode*/
function edit()
{
    //convert each cardset item to html and add to zone11
    for (var i=0;i<cards.length;i++)
    {
        //Populate base html template 
        var html = 
            `<div id="pair_${i}" class="pair">
                <div class='term_wrapper'>
                    <div id="term_${i}" class="term"></div>
                </div>
                <div class='term_wrapper'>
                    <div id="def_${i}" class="def"></div>
                </div>
                <span class="material-icons" onclick="$('#pair_${i}').remove();cards.splice(${i},1)" style='position:absolute;right:0;top:.5em;'>delete</span>
            <div>`
        //Add base html
        $('#zone11').append(html)
        //Populate base html with content
        setUpQuillForCardDivs(cards[i],i)
    }

    $('#zone1').append(
        $('<button id=\'add\'>Add new term</button>').click(()=>{
            //Populate base html template 
            
            cards.push(null)
            var i=cards.length-1;
            var html = 
            `<div id="pair_${i}" class="pair">
                <div class='term_wrapper'>
                    <div id="term_${i}" class="term"></div>
                </div>
                <div class='term_wrapper'>
                    <div id="def_${i}" class="def"></div>
                </div>
                <span class="material-icons" onclick="$('#pair_${i}').remove();cards.splice(${i},1)" style='position:absolute;right:0;top:.5em;'>delete</span>
            <div>`
            
            $('#zone11').append(html)   
            
            setUpQuillForCardDivs(cards[i],i)        
    
        }
    ))
}


//Display card one at a time in random order and keep score
function practice()
{
    var practiceOrder = [...Array(cards.length).keys()];
    shuffleArray(practiceOrder);
    var correct = 0;
    var incorrect = 0;
    var card_side = 0; //start with term

    //Create the div for this section
    var practice_card = $('<div id=\'practice_card\'></div>')
    var practice_incorrect = $('<div>Incorrect</div>').attr('id', 'practice_incorrect')
    var practice_correct = $('<div>Correct</div>').attr('id', 'practice_correct')
    var current_index = 0;

    //Add sections zone11
    $('#zone11').append(practice_card,practice_incorrect,practice_correct)

    //Create Quill for card_div
    practice_quill = new Quill('#practice_card', {
        modules: {
          toolbar: false
        },
        placeholder: '',
        theme: 'snow'  // or 'bubble'
      });
    practice_quill.disable();
    $(practice_quill.container.children[0]).addClass('practice')

    practice_quill.setContents(cards[practiceOrder[0]][0].getContents())

    practice_card.click(function(){
        if (card_side ==0)
        {
            practice_quill.setContents(cards[practiceOrder[current_index]][1].getContents())
            card_side=1;
        }
        else
        {
            practice_quill.setContents(cards[practiceOrder[current_index]][0].getContents())
            card_side=0;
        }
    })

    practice_correct.click(function(){
        correct++;
        current_index++;
        if (current_index < practiceOrder.length)
        {
            practice_quill.setContents(cards[practiceOrder[current_index]][0].getContents())
            card_side=0;
        }
        else
        {
            alert(`You got ${correct} correct and ${incorrect} incorrect.`)
            updateBody()
        }
    })

    practice_incorrect.click(function(){
        incorrect++;
        current_index++;
        if (current_index < practiceOrder.length)
        {
            practice_quill.setContents(cards[practiceOrder[current_index]][0].getContents())
            card_side=0;
        }
        else
        {
            alert(`You got ${correct} correct and ${incorrect} incorrect.`)
            updateBody()
        }
    })

}


function setUpQuillForCardDivs(card,i)
{
    //Create toolbar options for card rich text editors
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
      
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
      
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
      
        ['myImage','link','formula','video','clean']      // remove formatting button
      ];

    //Setup cards as rich text editors
    var term_quill = new Quill('#term_'+i, {
        modules: {
          toolbar: toolbarOptions
        },
        placeholder: 'Enter a term...',
        theme: 'snow'  // or 'bubble'
      });
    var def_quill = new Quill('#def_'+i, {
    modules: {
        toolbar: toolbarOptions
    },
    placeholder: 'Enter a definition...',
    theme: 'snow'  // or 'bubble'
    });

    if (card != null)
    {
        if (typeof card[i].getContents === 'function')
        {
            term_quill.setContents(card[0].getContents())
            def_quill.setContents(card[1].getContents())
        }
        else{
            term_quill.setContents(card[0])
            def_quill.setContents(card[1])
        }
    }
    cards[i] = ([term_quill,def_quill])
   
}

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

/**Taken from https://stackoverflow.com/a/12646864 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
//Get upload
//display fields


//Make Notes
//Quiz
//export

