jQuery.extend({
    //ʱ���ʽת��
    jsonDateConvert: function (jsondate) {
        jsondate = jsondate.replace("/Date(", "").replace(")/", "");
        if (jsondate.indexOf("+") > 0) {
            jsondate = jsondate.substring(0, jsondate.indexOf("+"));
        }
        else if (jsondate.indexOf("-") > 0) {
            jsondate = jsondate.substring(0, jsondate.indexOf("-"));
        }

        var date = new Date(parseInt(jsondate, 10));
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

        return date.getFullYear() + "-" + month + "-" + currentDate + " " + date.getHours() + ":" + date.getMinutes();

    }

});

(function ($) {
    //if ($('script[src$="layer.js"]').length == 0) {

    //    $.getScript("../../js/layer/layer.js");
    //}
    //if ($('script[src$="jquery.format.min.js"]').length == 0) {
    //    $.getScript("../../js/jquery.format.min.js");
    //}
    $.fn.mydatagrid = function (opt) {

     
        var layerload;
        opt = $.extend($.fn.mydatagrid.defaults, opt);
        opt.data.page = opt.page;
        opt.data.pageSize = opt.pageSize;
        var o = this;
        if (opt.isWebApi) {
            var urlPraRegex = /.+\?.+=.*/
            if (urlPraRegex.test(opt.url)) {
                opt.url += "&page=" + opt.page + "&pageSize=" + opt.pageSize;
            }
            else {
                opt.url += "?page=" + opt.page + "&pageSize=" + opt.pageSize;
            }

            delete opt.data.page;
            delete opt.data.pageSize;
        }
        var pageFuncGrid = function () {
            o.html("");
            $.ajax({
                url: opt.url,
                type: 'Post',
                dataType: 'json',
                global: false,
                cache: false,
                timeout: 120000,
                data: opt.data,
                async: opt.async,
                beforeSend: function () {

                    layerload = layer.load();
                },
                complete: function () {
                    layer.close(layerload);
                    
                },
                success: function (data) {
                    if (opt.isWebApi) {
                        if (!data.result) {
                            layer.alert(data.msg);
                            return;
                        }
                        data = data.data;
                    }
                    $("#" + opt.pageid).html("");
                    o.html("");
                    if (data.Dtable.length == 0 && opt.isQuestion) {
                        o.html("<div style=' color: #b77336; font-size: 22px; padding-top: 150px; text-align:center ;'>������Ŀ</div>");
                        return;
                    }
                    //����ҳ��ģ��
                    var tableInfo = "<table></table>";
                    var tables = $(tableInfo);
                    var titleInfo = "<tr>" + (opt.isCheckbox ? "<td><input type='checkbox' id='CheckALL'  onclick='CheckALL()'></td>" : "");
                    //�Զ����
                    titleInfo += (opt.isAutoNumber ? "<td>���</td>" : "");

                    for (var i = 0; i < opt.fields.length; i++) {
                        //��ӱ�ͷ
                        titleInfo += "<td>" + opt.fields[i].name + "</td>";

                    }
                    titleInfo += "</tr>";
                    tables.append(titleInfo);
                    //����


                    $.each(data.Dtable, function (i, item) {

                        var checkValue = (opt.checkBindKey != undefined && opt.checkBindKey != null) ? "value='" + item[opt.checkBindKey] + "'" : "";
                        var rowhtml = "";
                        if (typeof (opt.overrideChcekBox) == "function") {
                            rowhtml = "<tr>" + (opt.isCheckbox ? "<td>" + opt.overrideChicekBox(item) + "</td>" : "");
                        }
                        else {

                            rowhtml = "<tr>" + (opt.isCheckbox ? "<td><input type='checkbox' class='mydatagridcheck' " + checkValue + "  name='mydatagridcheck_" + i + "' id='mydatagridcheck_" + i + "' /></td>" : "");
                        }
                        //�Զ����
                        rowhtml += (opt.isAutoNumber ? "<td>" + ((opt.page - 1) * opt.pageSize + i + 1) + "</td>" : "");

                        for (var j = 0; j < opt.fields.length; j++) {

                            var text = opt.fields[j].text
                            var textString = typeof (text);
                            switch (textString) {
                                case "function": rowhtml += "<td>" + text(item) + "</td>"; break;
                                case "undefined": {
                                    if (opt.dataSourceType == "Array") {
                                        //�Ƿ�ض�
                                        if (opt.subLength == 0) {
                                            rowhtml += "<td>" + replaceNullUndefind(item[j]) + "</td>";
                                        }
                                        else {
                                            if (replaceNullUndefind(item[j]).length > opt.subLength) {
                                                rowhtml += "<td>" + replaceNullUndefind(item[j]).substr(0, opt.subLength) + "......" + "</td>";
                                            }
                                            else {
                                                rowhtml += "<td>" + replaceNullUndefind(item[j]) + "</td>";
                                            }
                                           
                                        }

                                    }
                                    else {
                                        //�Ƿ�ض�
                                        if (opt.subLength == 0) {
                                            rowhtml += "<td>" + replaceNullUndefind(item[opt.fields[j].key]) + "</td>";
                                        }
                                        else {
                                            if (replaceNullUndefind(item[opt.fields[j].key]).length > opt.subLength) {
                                                rowhtml += "<td>" + replaceNullUndefind(item[opt.fields[j].key]).substr(0, opt.subLength) + "......" + "</td>";
                                            }
                                            else {
                                                rowhtml += "<td>" + replaceNullUndefind(item[opt.fields[j].key]) + "</td>";
                                            }

                                        }

                                    }
                                    break;
                                }
                                default: rowhtml += "<td>" + text + "</td>";
                            }
                        }
                        rowhtml += "</tr>";
                        var rowDom = $(rowhtml);
                        if (opt.isCheckbox && opt.checkClick != null) {

                            $(rowDom).find("#mydatagridcheck_" + i).click(function () { return opt.checkClick(item); });
                        }

                        $(tables).append(rowDom);


                    })



                    $("#" + opt.pageid).html(data.PageHtml);

                    o.append($(tables));
                    if (opt.callbackFunc != null) {
                        opt.callbackFunc();
                    }


                },
                error: function (XmlHttpRequest, textStatus, errorThrown) {
                    o.html("�޴�������Ŀ");
                    return false;
                }
            });
        }
        pageFuncGrid();

    };
    $.fn.mydatagrid.defaults = {
        fields: null,
        data: {},
        url: null,
        pageid: null,
        page: 1,
        pageSize: 10,
        //�Ƿ��и�ѡ��
        isCheckbox: true,
        //�󶨸�ѡ����¼�
        checkClick: null,
        //�󶨸�ѡ���valueֵ
        checkBindKey: null,
        //������ݲ���table�����������Array
        dataSourceType: "Table",
        //�Զ���� 1��2��3��4��5
        isAutoNumber: true,
        //��дcheckbox
        overrideChcekBox: null,
        callbackFunc: null,
        //�Ƿ���webapiģʽ����
        isWebApi: false,
        //�ض��ַ�0���ض�
        subLength: 30,
        async: true,
        //�Ƿ�δ��Ŀ�б�
        isQuestion: true
    }
    $.fn.mydatagrid.getCheckValue = function () {
        var ids = "";
        this.find(".mydatagridcheck").each(function () {
            ids += $(this).attr("value") + ","

        })
        return ids.substring(0, ids.length - 1);

    }
    function CheckALL() {
        $(".mydatagridcheck").each(function () {

            if ($("#CheckALL").attr("checked")) {
                $(this).attr("checked", true);
            }
            else {
                $(this).attr("checked", false);
            }

        });


    }
    function replaceNullUndefind(s) {

        if (s == null || s == undefined) {
            return "";
        }
        return s;
    }

})(jQuery)