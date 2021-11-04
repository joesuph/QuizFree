var cards = [];
var taggedCards = {};

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
        updateBody();
        
    })
    var upload_set_butt = $('<input type=\'file\' id=\'file_input\'>').change(()=>{
        var fr = new FileReader();
        fr.onload = ()=>{
            cards = JSON.parse(fr.result)
            window.hide() 
            updateBody();
        }
        fr.readAsText($('#file_input')[0].files[0])
    })

    window.append(new_set_butt,upload_set_butt)
    $('body').append(window)

}) 

/**
 * 
 * @summary 
 * @param {*} interaction 
 */
function updateBody(interaction=1)
{
    //Create task buttons
    //Create interaction section
    $('#zone1').html('').append('<div id=\'zone11\'></div>').show()

    edit()

    //Convert inputs of fields to strings, create file, and download
    $('#export_but').show().click(()=>{
        download(JSON.stringify(cards.map(card=>card.map(side=>side.getContents()))), 'cardset.txt', 'text/plain')
    })
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
                <span class="material-icons" onclick="$('#pair_${i}').remove()" style='position:absolute;right:0;top:.5em;'>delete</span>
            <div>`
        //Add base html
        $('#zone11').append(html)
        //Populate base html with content
        readCardIntoDiv(cards[i],i)
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
                <span class="material-icons" onclick="$('#pair_${i}').remove();quills.splice(${i},1)" style='position:absolute;right:0;top:.5em;'>delete</span>
            <div>`
            
            $('#zone11').append(html)   
            
            readCardIntoDiv(cards[i],i)        
    
        }
    ))
}


function readCardIntoDiv(card,i)
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
      
        ['myImage','link','formula','video','clean']                                         // remove formatting button
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
    init_image_button(term_quill)
    init_image_button(def_quill)

    if (card != null)
    {
        term_quill.setContents(card[0])
        def_quill.setContents(card[1])
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

//Get upload
//display fields


//Make Notes
//Quiz
//export

