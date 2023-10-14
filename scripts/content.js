import { search } from "./page-searcher";

console.log("START");
var isActive = false;

var searchObjects;

chrome.storage.sync.get(["settingsJSON"]).then((result) =>
{
    searchObjects =
        result.settingsJSON.searchObjectGroups[
        result.settingsJSON.currentObjectGroup
        ];
    highlightAll();
});

document.onkeydown = (event) =>
{
    if (event.repeat) return;
    if (event.ctrlKey && event.shiftKey && event.code == "Backquote")
    {
        switchActive();
    }
};

function highlightSubstringNodes(nodesWithCoordinates)
{
    function groupByNode(nodesWithCoordinates)
    {
        let groups = new Map();

        nodesWithCoordinates.forEach((nodeData) =>
        {
            if (!groups.has(nodeData.node))
            {
                groups.set(nodeData.node, []);
            }
            groups.get(nodeData.node).push(nodeData);
        });

        return groups;
    }

    let nodeGroups = groupByNode(nodesWithCoordinates);

    nodeGroups.forEach((nodeDataArray, node) =>
    {
        highlightNode(node, nodeDataArray);
    });
}

function highlightNode(node, nodeDataArray)
{
    let nodeText = node.nodeValue;

    nodeDataArray.sort((a, b) => a.startIndex - b.startIndex);

    let previousEndIndex = 0;
    let parentNode = node.parentNode;

    nodeDataArray.forEach((nodeData) =>
    {
        if (nodeData.startIndex < previousEndIndex)
        {
            return;
        }

        let beforeMarkText = nodeText.substring(
            previousEndIndex,
            nodeData.startIndex
        );
        let beforeMarkNode = document.createTextNode(beforeMarkText);

        let markedText = nodeText.substring(
            nodeData.startIndex,
            nodeData.endIndex
        );
        let markedNode = document.createElement("span");
        markedNode.className = "search-object";
        markedNode.setAttribute(
            "data-search-object-id",
            nodeData.searchObjectID
        );
        markedNode.appendChild(document.createTextNode(markedText));
        markedNode.style.backgroundColor =
            searchObjects[nodeData.searchObjectID].color;

        markedNode.onmouseover = (event) =>
        {
            if (!isActive) return;
            var tooltip = document.createElement("div");
            document.body.appendChild(tooltip);

            tooltip.textContent =
                searchObjects[nodeData.searchObjectID].description;
            tooltip.className = "searchObjectTooltip";

            let rect = event.target.getBoundingClientRect();
            tooltip.style.left = rect.left + window.scrollX + "px";
            tooltip.style.top = rect.top + window.scrollY + rect.height + "px";
            markedNode.onmouseout = () =>
            {
                tooltip.remove();
            };
        };

        parentNode.insertBefore(beforeMarkNode, node);
        parentNode.insertBefore(markedNode, node);

        previousEndIndex = nodeData.endIndex;
    });

    let afterLastMarkText = nodeText.substring(previousEndIndex);
    let afterLastMarkNode = document.createTextNode(afterLastMarkText);
    parentNode.insertBefore(afterLastMarkNode, node);

    parentNode.removeChild(node);
}

function switchActive()
{
    if (isActive)
    {
        clearAll();
    } else
    {
        showAll();
    }
}

function highlightAll()
{
    if (isActive) return;
    highlightSubstringNodes(search(document, searchObjects.map((searchObject) => searchObject.aliases)));
    isActive = !isActive;
}

function showAll()
{
    if (isActive) return;
    document.querySelectorAll(".search-object").forEach((element) =>
    {
        element.style.backgroundColor =
            searchObjects[element.getAttribute("data-search-object-id")].color;
    });
    isActive = !isActive;
}

function clearAll()
{
    if (!isActive) return;
    document.querySelectorAll(".search-object").forEach((element) =>
    {
        element.style.backgroundColor = "#00000000";
    });
    isActive = !isActive;
}
