var cardset = null;
var quills = [];

//Set Cardset
$('#start_set').click(()=>{
    var window = $("<div></div>").css({
        'position':'absolute',
        'margin':'auto',
        'height':'3em',
        'top':'2em',
        'left':'20%',
        'align-items':'center',
        'background-color':'#efefef',
        'box-shadow': '5px 5px 5px grey',
        'padding':'2em'
    })
    var exitButt = $('<span class="material-icons">cancel</span>').css({
            'position':'absolute',
            'right':'0',
            'top':'0',
            'cursor':'pointer'
    }).click((e)=>{window.hide()})
    .mouseenter((e)=>{e.target.style.color='red';})
    .mouseleave((e)=>{e.target.style.color='grey';})
    window.append(exitButt)
    

    var new_set_butt = $('<button>Create New</button>').click(()=>{
        cardset = [null]
        window.hide()
        updateBody();
        
    })
    var upload_set_butt = $('<input type=\'file\' id=\'file_input\'>').change(()=>{
        var fr = new FileReader();
        fr.onload = ()=>{
            var text = fr.result;
            window.hide()
            cardset = text.split('\\]').slice(0,-1)
            updateBody();
            
        }
        fr.readAsText($('#file_input')[0].files[0])
    })

    window.append(new_set_butt,upload_set_butt)
    $('body').append(window)

}) 

//Provide interaction options and show card fields
function updateBody(interaction=1)
{
    //Create task buttons
    var butt1 = $('<button>Practice</button>').click(()=>{updateBody(2)});
    var butt2 = $('<button>Edit</button>').click(()=>{updateBody(1)});
    //Create interaction section
    $('#zone1').html('').append(butt1,butt2,'<div id=\'zone11\'></div>').show().css({
        'border':'1px solid black',
        'margin':'auto',
        'margin-top':'3em',
        'width':'90%'
    });

    if (interaction==1)
    {
        //start default interaction
        edit()
    }
    else if (interaction==2){
        practice()
    }

    //Convert inputs of fields to strings, create file, and download
    $('#export_but').show().click(()=>{
        var data = "";
        for(var i=0;i<quills.length;i++)
        {
            data += JSON.stringify(quills[i][0].getContents()) + "\\>" + JSON.stringify(quills[i][1].getContents()) + "\\]";
        }
        download(data, 'cardset.txt', 'text/plain')
    })
}

function practice()
{
    
}

/* Start edit mode*/
function edit()
{
    //Set styles
    var div_style="width:100%;display:grid;grid-template-columns:auto auto;overflow:hidden;margin-top:2em;\
    border:1px solid black;position:relative;background-color:#fafafa;border-radius:1em";
    var wrapper_div_style = "overflow:visible;height:15em;position:relative;width:45vw;border-radius:5em"


    //convert each cardset item to html and add to zone11
    for (var i=0;i<cardset.length;i++)
    {
        //Populate base html template 
        var html = 
            `<div style="${div_style}" id="pair_${i}">
                <div style="${wrapper_div_style}">
                    <div id="term_${i}" class="term"></div>
                </div>
                <div style="${wrapper_div_style}">
                    <div id="def_${i}" class="def"></div>
                </div>
                <span class="material-icons" onclick="$('#pair_${i}').remove()" style='position:absolute;right:0'>delete</span>
            <div>`
        //Add base html
        $('#zone11').append(html)

        //Populate base html with content
        readCardIntoDiv(cardset[i],i)
    }

    $('#zone1').append(
        $('<button id=\'add\'>Add new term</button>').click(()=>{
            //Populate base html template 
            
            cardset.push(null)
            var i=cardset.length-1;
            var html = 
            `<div style="${div_style}" id="pair_${i}">
                <div style="${wrapper_div_style}">
                    <div id="term_${i}" class="term"></div>
                </div>
                <div style="${wrapper_div_style}">
                    <div id="def_${i}" class="def"></div>
                </div>
                <span class="material-icons" onclick="$('#pair_${i}').remove();quills.splice(${i},1)" style='position:absolute;right:0'>delete</span>
            <div>`
            
            $('#zone11').append(html)   
            
            readCardIntoDiv(cardset[i],i)        
    
        }
    ))
}


function readCardIntoDiv(text,i)
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
    //Store quills to grab content later when needed
    quills.push([term_quill,def_quill])

    //If new cardset, leave cards empty
    if (text == null)
        return;

    //separate term from definition
    var pair = text.split('\\>').map((t)=>{return JSON.parse(t)})
    var term = pair[0]
    var definition = pair[1]

    term_quill.setContents(term)
    def_quill.setContents(definition)
    
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

