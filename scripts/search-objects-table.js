export function createSearchObjectsTable(tableData, divID)
{

    var rowMenu = 
    [
        {
            label:"Add Row",
            action:function(e, row)
            {
                
            }
        },
        {
            label:"Delete Row",
            action:function(e, row)
            {
                
            }
        }
    ];

    var table = new Tabulator(divID, 
    {
        layout:"fitColumns",
        data:tableData,
        height: 500,
        rowContextMenu: rowMenu,
        movableColumns:true,
        columns:
        [
            {
                title:"Aliases", 
                field:"aliases", 
                editor: function tagStringEditor(cell, onRendered, success, cancel, editorParams)
                {
                    var cellValue = cell.getValue().toString();
                    var input = document.createElement("input");
                
                    input.value = cellValue;
                
                    onRendered
                    (
                        function()
                        {
                            input.focus();
                            input.style.height = "100%";
                        }
                    );
                
                    function onChange()
                    {
                        if(input.value != cellValue)
                        {
                            console.log(input.value.split(","))
                            success(input.value.split(","));
                        }
                        else
                        {
                            cancel();
                        }
                    }
                
                    input.addEventListener("blur", onChange);
                
                    input.addEventListener("keydown", (event) =>
                    {
                        if(event.key == 'Enter')
                        {
                            onChange();
                        }
                
                        if(event.key == 'Esc')
                        {
                            cancel();
                        }
                    });
                
                    return input;
                }
            },
            {
                title:"Description", 
                field:"description", 
                editor:"input"
            },
            {
                title:"Color",
                field:"color",
                formatter:'color',
                editor:function(cell, onRendered, success, cancel)
                {
                    var cellValue = cell.getValue();
                    var input = document.createElement("input");
                
                    input.setAttribute("type", "color");
                    input.setAttribute("value", cellValue);

                    input.style.height = "100%";
                    input.style.width = "100%";

                    onRendered(() =>
                    {
                        input.focus();
                    });

                    function onChange()
                    {
                        console.log(input.value)
                        if(input.value != cellValue)
                        {
                            success(input.value);
                        }
                        else
                        {
                            cancel();
                        }
                    }
                    input.addEventListener("change", onChange);
                    input.addEventListener("keydown", (e) =>
                    {
                        if(e.keyCode == 13){
                            onChange();
                        }
                
                        if(e.keyCode == 27){
                            cancel();
                        }
                    });
                    return input;
                }
            }
        ],
    });

    return table;
}
