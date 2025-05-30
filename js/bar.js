(function() {
// 图表尺寸和边距配置
const width = 850, height = 600;
const margin = { top: 60, right: 150, bottom: 200, left: 100 };
let svg, x, y;

// 初始化图表基础结构
function initChart() {
    svg = d3.select("#chart")
        .attr("width", width)
        .attr("height", height);

    // 创建固定容器（避免重绘时重复创建）
    svg.append("g").attr("class", "x-axis");
    svg.append("g").attr("class", "y-axis");
    svg.append("text").attr("class", "x-axis-label");
    svg.append("text").attr("class", "y-axis-label");
}

// 核心更新函数
async function updateChart(selectedField) {
    // 加载数据
    const data = await d3.json("data/field_top10.json");
    const fieldData = data[selectedField];

    // 处理数据（假设JSON已预排序，实际可根据需要添加.sort()）
    const processedData = fieldData.map(d => ({
        Affiliation: d.Affiliation,
        value: d.count
    }));

    // 更新比例尺
    x = d3.scaleBand()
        .domain(processedData.map(d => d.Affiliation))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    y = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // 柱状图更新模式
    const bars = svg.selectAll(".bar")
        .data(processedData, d => d.Affiliation);

    // 移除多余元素
    bars.exit()
        .transition().duration(300)
        .attr("height", 0)
        .attr("y", height - margin.bottom)
        .remove();

    // 更新现有元素
    bars.transition().duration(500)
        .attr("x", d => x(d.Affiliation))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.value))
        .attr("height", d => y(0) - y(d.value));

    // 添加新元素
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", "#4e79a7")
        .attr("x", d => x(d.Affiliation))
        .attr("y", y(0))
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .transition().duration(500)
        .attr("y", d => y(d.value))
        .attr("height", d => y(0) - y(d.value));

    // 更新X轴
    svg.select(".x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("font-size", "14px") 
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .attr("dy", "0.5em");

    // 更新Y轴
    svg.select(".y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

    // 更新X轴标签
    svg.select(".x-axis-label")
        .attr("x", margin.left + (width - margin.left - margin.right) / 2)
        .attr("y", height - margin.bottom / 2 + 40) // 调整位置以避免遮挡标签
        .style("text-anchor", "middle")
        .text("机构")
        .style("font-size", "16px");

    // 更新Y轴标签
    svg.select(".y-axis-label")
        .attr("x", -margin.left / 2 - (height - margin.top - margin.bottom) / 2)
        .attr("y", margin.left / 2)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("获奖次数")
        .style("font-size", "16px");

    // Tooltip交互
    svg.selectAll(".bar")
        .on("mouseover", function(event, d) {
            d3.select("#bar-tooltip")
                .style("display", "block")
                .style("opacity", 1)
                .html(`<strong>${d.Affiliation}</strong><br/><span>获奖次数: ${d.value}</span>`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select("#bar-tooltip")
                .style("display", "none")
                .style("opacity", 0);
        });

}

// 初始加载和事件监听
initChart();
updateChart("Physics"); // 默认加载物理学数据

d3.select("#field-select").on("change", function() {
    updateChart(this.value);
});

})(); 