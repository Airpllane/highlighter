export function createSearchObjectsTable(tableData, divID)
{
    var table = new Tabulator(divID,
        {
            layout: "fitColumns",
            data: tableData,
            height: 500,
            movableColumns: true,
            movableRows: true,
            rowContextMenu: [
                {
                    label: "Add item",
                    action: function (e, row)
                    {
                        row.getTable().addData([{ aliases: ["New"], color: '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'), description: "New description" }], false);
                    }
                },
                {
                    label: "Delete item",
                    action: function (e, row)
                    {
                        row.delete();
                    }
                }
            ],
            columns:
                [
                    {
                        title: "Aliases",
                        field: "aliases",
                        editor: aliasesEditor
                    },
                    {
                        title: "Description",
                        field: "description",
                        editor: "input"
                    },
                    {
                        title: "Color",
                        field: "color",
                        formatter: 'color',
                        editor: function (cell, onRendered, success, cancel)
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
                                if (input.value != cellValue)
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
                                if (e.keyCode == 13)
                                {
                                    onChange();
                                }

                                if (e.keyCode == 27)
                                {
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

function aliasesEditor(cell, onRendered, success, cancel)
{
    var cellValue = cell.getValue();

    var container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.zIndex = "9998";

    var blocker = document.createElement("div");
    blocker.style.width = "100%";
    blocker.style.height = "100%";
    blocker.style.backgroundColor = "rgba(0,0,0,0.5)";
    container.appendChild(blocker);

    var modal = document.createElement("div");
    modal.style.position = "absolute";
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.backgroundColor = "white";
    modal.style.padding = "10px";
    modal.style.width = "400px";
    modal.style.height = "300px";
    modal.style.overflow = "auto";
    container.appendChild(modal);

    var aliasTable = new Tabulator(modal, {
        data: cellValue.map(alias => ({ alias: alias })),
        layout: "fitColumns",
        rowContextMenu: [
            {
                label: "Add alias",
                action: function (e, row)
                {
                    row.getTable().addData([{ alias: "New" }], false);
                }
            },
            {
                label: "Delete alias",
                action: function (e, row)
                {
                    row.delete();
                }
            }
        ],
        columns: [
            {
                title: "Alias",
                field: "alias",
                editor: "input"
            }
        ]
    });

    function closeModal()
    {
        document.body.removeChild(container);
        document.getElementById("page-content").style.filter = "";
        var data = aliasTable.getData();
        success(data.map(item => item.alias));
    }

    blocker.addEventListener("click", closeModal);
    document.getElementById("page-content").style.filter = "blur(5px)";
    document.body.appendChild(container);
    onRendered(() =>
    {
        modal.focus();
    });
}