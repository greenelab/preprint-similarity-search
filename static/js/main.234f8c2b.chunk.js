(this["webpackJsonppreprint-similarity-search"]=this["webpackJsonppreprint-similarity-search"]||[]).push([[0],{44:function(e,t,n){},60:function(e,t,n){},67:function(e,t,n){},68:function(e,t,n){},79:function(e,t,n){},80:function(e,t,n){},81:function(e,t,n){},82:function(e,t,n){},83:function(e,t,n){},84:function(e,t,n){"use strict";n.r(t);var r,c,a,s,i,o,l=n(30),u=n(94),j=n(8),d=n(2);n(59);function h(){return(h=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function b(e,t){if(null==e)return{};var n,r,c=function(e,t){if(null==e)return{};var n,r,c={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(c[n]=e[n]);return c}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(c[n]=e[n])}return c}function p(e,t){var n=e.title,l=e.titleId,u=b(e,["title","titleId"]);return d.createElement("svg",h({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 100 100",id:"logo",ref:t,"aria-labelledby":l},u),n?d.createElement("title",{id:l},n):null,r||(r=d.createElement("style",null,"\n    #logo:hover #star,\n    #logo[data-spin] #star {\n      animation: star_rotate 2s ease forwards infinite;\n    }\n    @keyframes star_rotate {\n      from {\n        transform: rotate(0);\n      }\n      to {\n        transform: rotate(360deg);\n      }\n    }\n  ")),c||(c=d.createElement("path",{id:"book_filling",fill:"#ffe0b2",d:"       M 10 50       L 50 70       L 90 50       L 90 35       L 50 55       L 10 35       A 10 10 0 0 0 10 50       M 10 65       L 50 85       L 90 65       L 90 50       L 50 70       L 10 50       A 10 10 0 0 0 10 65     "})),a||(a=d.createElement("path",{id:"book_top_cover",fill:"#000000",stroke:"#000000",strokeWidth:5,strokeLinecap:"round",strokeLinejoin:"round",d:"       M 50 15       L 90 35       L 50 55       L 10 35       z     "})),s||(s=d.createElement("path",{id:"book_outlines",fill:"none",stroke:"#000000",strokeWidth:5,strokeLinecap:"round",strokeLinejoin:"round",d:"       M 10 50       L 30 60       M 47.5 68.75       L 50 70       L 90 50       M 10 65       L 50 85       L 90 65       M 10 35       A 10 10 0 0 0 10 50       A 10 10 0 0 0 10 65     "})),i||(i=d.createElement("path",{id:"bookmark",fill:"#000000",stroke:"#000000",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round",d:"       M 35 55       L 35 71.25       L 38.75 69.25       L 42.5 74.75       L 42.5 58.75       z     "})),o||(o=d.createElement("g",{transform:"translate(50,34) rotate(26.565) skewX(-26.565) scale(0.10)"},d.createElement("path",{id:"star",fill:"#ffe0b2",stroke:"#ffe0b2",strokeWidth:20,strokeLinecap:"round",strokeLinejoin:"round",d:"         M 0.000 -100.000         L 29.389 -40.451         L 95.106 -30.902         L 47.553 15.451         L 58.779 80.902         L 0.000 50.000         L -58.779 80.902         L -47.553 15.451         L -95.106 -30.902         L -29.389 -40.451         z       "}))))}var f=d.forwardRef(p),x=(n.p,n(60),n(0)),m=function(){return Object(x.jsx)("header",{children:Object(x.jsxs)("section",{children:[Object(x.jsx)("h1",{children:"Preprint"}),Object(x.jsx)("h2",{children:"Similarity Search"}),Object(x.jsx)(f,{className:"logo"})]})})},O=n(12),g=n.n(O),v=n(17),y=n(11),w=n(6),k=n(9),L=n(15),S=n(37),P=n(45),_=n(46),M=n(49),N=n(50),C=function(e){Object(_.a)(n,e);var t=Object(M.a)(n);function n(){var e;Object(P.a)(this,n);for(var r=arguments.length,c=new Array(r),a=0;a<r;a++)c[a]=arguments[a];return(e=t.call.apply(t,[this].concat(c))).name="CustomError",e}return n}(Object(N.a)(Error)),E=function(){var e=Object(v.a)(g.a.mark((function e(t){var n,r,c,a,s,i,o,l,u,j,d;return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.doi,r=t.text,c=r?"https://api-pss.greenelab.com/text":"https://api-pss.greenelab.com/doi/"+n,a={method:r?"POST":"GET",body:r||null},e.next=5,fetch(c,a);case 5:if((s=e.sent).ok){e.next=8;break}throw new Error;case 8:return e.next=10,s.json();case 10:if(!(i=e.sent).message){e.next=13;break}throw new C(i.message);case 13:return(o=i.paper_info||{}).xml_found=i.xml_found,l=i.journal_neighbors||[],u=i.paper_neighbors||[],j=i.coordinates||{},d=function(e){return e.pmcid=(e.pmcid||e.document||"").replace("PMC","")},l.forEach(d),u.forEach(d),e.abrupt("return",{preprint:o,similarJournals:l,similarPapers:u,coordinates:j});case 22:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),D=function(){var e=Object(v.a)(g.a.mark((function e(t){var n,r,c;return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.map((function(e){return e.pmcid})).filter((function(e){return e})),e.next=3,fetch("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pmc&email=greenescientist@gmail.com&retmode=json&id="+n.join(","));case 3:return e.next=5,e.sent.json();case 5:return r=e.sent.result,c=function(e){return Object(S.a)(Object(S.a)({},e),r[e.pmcid]||{})},t=t.map(c),e.abrupt("return",t);case 9:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),F=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return{id:e.doi||null,title:e.title||"",authors:(e.authors||"").split("; ").join(", "),journal:e.publisher||"",year:(e.accepted_date||"").split("-")[0]||"",prelim:!e.xml_found,text:!e.title}},A=function(e){var t=e.map((function(e){return e.distance})),n=Math.max.apply(Math,Object(L.a)(t)),r=Math.min.apply(Math,Object(L.a)(t)),c=n-r;return e.sort((function(e,t){return e.distance-t.distance})),e=e.map((function(e,t){return{id:e.pmcid||null,title:e.title||"",authors:(e.authors||[]).map((function(e){return e.name||""})).filter((function(e){return e})).join(", "),journal:(e.fulljournalname||e.journal||"").split("_").join(" "),year:(e.pubdate||"").split(" ")[0]||"",distance:e.distance,strength:(e.distance-r)/c,rank:t+1}}))},T=n(7),I=n(47),J=(n(67),"EMPTY"),q="LOADING",z="SUCCESS",B=function(e){var t=e.status;return t===J?Object(x.jsxs)("section",{className:"center gray",children:[Object(x.jsx)(w.a,{icon:k.b}),Object(x.jsx)("span",{children:"Search for a doi"})]}):t===q?Object(x.jsxs)("section",{className:"center gray",children:[Object(x.jsx)(w.a,{icon:k.i,spin:!0}),Object(x.jsx)("span",{children:"Loading..."})]}):t===z?null:Object(x.jsxs)("section",{className:"center red",children:[Object(x.jsx)(w.a,{icon:I.a}),Object(x.jsx)("span",{children:t||"Couldn't get results"})]})},R=(n(68),function(e){return e.replace(/^\D*/g,"").replace(/v\d+$/g,"").trim()}),W=function(){return new URLSearchParams(window.location.search.substring(1)).get("doi")},X=function(e){var t=window.location.href,n=window.location.href.split(/[?#]/)[0]+(e?"?doi="+e:"");t!==n&&window.history.pushState(null,null,n)},G=function(e){var t=e.status,n=e.setStatus,r=e.setPreprint,c=e.setSimilarJournals,a=e.setSimilarPapers,s=e.setCoordinates,i=Object(d.useState)(W()||"e.g. 10.1101/833400"),o=Object(j.a)(i,2),l=o[0],u=o[1],h=Object(d.useState)(!1),b=Object(j.a)(h,2),p=b[0],f=b[1],m=Object(d.useCallback)((function(e){return u(e.target.value.trim())}),[]),O=Object(d.useCallback)(function(){var e=Object(v.a)(g.a.mark((function e(t){var i,o,l,j,d,h,b,p,f=arguments;return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(i=t.doi,o=t.text,l=!(f.length>1&&void 0!==f[1])||f[1],i&&(i=R(i),u(i)),""!==i){e.next=5;break}return e.abrupt("return");case 5:return l&&X(i),n(q),e.prev=7,e.next=10,E({doi:i,text:o});case 10:return j=e.sent,d=j.preprint,h=j.similarJournals,b=j.similarPapers,p=j.coordinates,d=F(d),e.next=18,D(h);case 18:return h=e.sent,e.next=21,D(b);case 21:b=e.sent,h=A(h),b=A(b),n(z),r(d),c(h),a(b),s(p),e.next=41;break;case 31:e.prev=31,e.t0=e.catch(7),console.log(e.t0),"CustomError"!==e.t0.name&&(e.t0.message="Couldn't get results"),n(e.t0.message),r({}),c([]),a([]),s({}),y.a(e.t0,{tags:{doi:i}});case 41:case"end":return e.stop()}}),e,null,[[7,31]])})));return function(t){return e.apply(this,arguments)}}(),[n,r,c,a,s]),L=Object(d.useCallback)((function(){var e=W();e&&(u(e),O({doi:e},!1))}),[O]);Object(d.useEffect)((function(){W()&&O(W())}),[O]),Object(d.useEffect)((function(){return window.addEventListener("popstate",L),function(){return window.removeEventListener("popstate",L)}}),[L,O]);var S=function(){var e=Object(v.a)(g.a.mark((function e(t){var n,r;return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t.preventDefault(),t.stopPropagation(),f(!1),"text/plain"===(n=t.dataTransfer.files[0]).type){e.next=6;break}return e.abrupt("return");case 6:return e.next=8,n.text();case 8:if(e.t0=e.sent,e.t0){e.next=11;break}e.t0="";case 11:r=e.t0,O({text:r});case 13:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(x.jsxs)("section",{id:"search",children:[Object(x.jsx)("p",{className:"center",children:Object(x.jsxs)("i",{children:["Enter the ",Object(x.jsx)("a",{href:"https://www.biorxiv.org/",children:"bioRxiv"})," or"," ",Object(x.jsx)("a",{href:"https://www.medrxiv.org/",children:"medRxiv"})," DOI of your preprint"]})}),Object(x.jsxs)("form",{className:"search",onSubmit:function(e){e.preventDefault(),O({doi:l})},onDragEnter:function(){return f(!0)},onDragLeave:function(){return f(!1)},onDragOver:function(e){return e.preventDefault()},onDrop:S,"data-drag":p,children:[Object(x.jsx)("input",{className:"search_input",value:l,onChange:m,type:"text",placeholder:"e.g. 10.1101/833400",disabled:t===q,onFocus:function(e){return e.target.select()}}),Object(x.jsx)(T.a,{content:"Search for related papers and journals",children:Object(x.jsx)("button",{className:"search_button",type:"submit",disabled:t===q,children:Object(x.jsx)(w.a,{icon:k.h})})})]})]})},Y=function(e){var t=e.preprint,n=t.id,r=t.title,c=t.authors,a=t.journal,s=t.year,i=t.prelim,o=t.text;return Object(x.jsxs)("section",{id:"your-preprint",children:[Object(x.jsxs)("h3",{children:[Object(x.jsx)(w.a,{icon:k.c}),Object(x.jsx)("span",{children:"Your Preprint"})]}),!o&&Object(x.jsxs)("p",{children:[Object(x.jsx)("a",{href:"https://doi.org/"+n,className:"card_detail",children:r}),Object(x.jsx)("span",{className:"card_detail truncate",tabIndex:"0",children:c}),Object(x.jsxs)("span",{className:"card_detail truncate",tabIndex:"0",children:[a," \xb7 ",s]})]}),!o&&i&&Object(x.jsx)(T.a,{content:"These results were generated using the PDF version of the preprint, which is less reliable and can reduce the accuracy of predictions. Check back later when the full-text version is available.",children:Object(x.jsxs)("p",{className:"center gray",children:[Object(x.jsx)(w.a,{icon:k.d}),Object(x.jsx)("span",{children:"Preliminary results"})]})}),o&&Object(x.jsx)(T.a,{content:"You uploaded a plain text version of your preprint",children:Object(x.jsxs)("p",{className:"center gray",children:[Object(x.jsx)(w.a,{icon:k.d}),Object(x.jsx)("span",{children:"Plain text"})]})})]})},U=n(13),H=n.n(U),V=(n(44),H()("#ff980020")),$=H()("#ff9800"),K=function(e){var t=e.similarJournals;return Object(x.jsxs)("section",{id:"similar-journals",children:[Object(x.jsx)(T.a,{content:"The closest journals within our generated paper embedding space",children:Object(x.jsxs)("h3",{children:[Object(x.jsx)(w.a,{icon:k.a}),Object(x.jsx)("span",{children:"Most Similar Journals"})]})}),t.map((function(e,t){var n=e.journal,r=e.rank,c=e.distance,a=e.strength;return Object(x.jsxs)("div",{className:"card",children:[Object(x.jsx)(T.a,{content:"Distance score: "+c.toFixed(2),children:Object(x.jsx)("div",{className:"card_score",style:{backgroundColor:$.mix(V,a)},children:r})}),Object(x.jsx)("div",{className:"card_details",children:Object(x.jsx)("a",{href:"https://www.google.com/search?q="+n,className:"card_detail",children:n})})]},t)}))]})},Q=H()("#ff980020"),Z=H()("#ff9800"),ee=function(e){var t=e.similarPapers;return Object(x.jsxs)("section",{id:"similar-papers",children:[Object(x.jsx)(T.a,{content:"The closest paper within our generated paper embedding space",children:Object(x.jsxs)("h3",{children:[Object(x.jsx)(w.a,{icon:k.g}),Object(x.jsx)("span",{children:"Most Similar Papers"})]})}),t.map((function(e,t){var n=e.id,r=e.title,c=e.authors,a=e.year,s=e.journal,i=e.rank,o=e.distance,l=e.strength;return Object(x.jsxs)("div",{className:"card",children:[Object(x.jsx)(T.a,{content:"Distance score: "+o.toFixed(2),children:Object(x.jsx)("div",{className:"card_score",style:{backgroundColor:Z.mix(Q,l)},children:i})}),Object(x.jsxs)("div",{className:"card_details",children:[Object(x.jsx)("a",{href:"https://www.ncbi.nlm.nih.gov/pmc/articles/"+n,className:"card_detail",children:r}),Object(x.jsx)("div",{className:"card_detail truncate",tabIndex:"0",children:c}),Object(x.jsxs)("div",{className:"card_detail truncate",tabIndex:"0",children:[s," \xb7 ",a]})]})]},t)}))]})},te=(n(79),function(e){var t=e.selectedPc,n=e.setSelectedPc;return Object(x.jsx)("p",{className:"center",children:ve(he,be).map((function(e){return Object(x.jsx)(ne,{number:e,selectedPc:t,setSelectedPc:n},e)}))})}),ne=function(e){var t=e.number,n=e.selectedPc,r=e.setSelectedPc;return Object(x.jsx)(T.a,{content:Object(x.jsx)("img",{src:we(t),className:"cloud_enlarged",alt:"Principal component "+ye(t)}),maxWidth:"none",children:Object(x.jsx)("button",{className:"cloud_button","data-number":ye(t),"data-selected":n===t,title:(n===t?"Deselect":"Select")+" this principal component",onClick:function(){return r(n===t?null:t)},children:Object(x.jsx)("img",{src:we(t),alt:"Principal component "+ye(t),loading:"lazy"})})})},re=n(21),ce=function(e,t,n){return Math.max(Math.min(e,n),t)},ae=function(e){return Math.pow(e,2)},se=function(e){return Math.sqrt(e)},ie=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;e=ce(e,0,1);var n=1/(t=ce(t,1e-5,1)),r=se(2*ae(n)-1);return(1+se(2)*se(2*e*r+ae(n)-r-2*ae(e)+2*e)-r)/2},oe=function(e){var t=Object(d.useRef)(),n=Object(d.useState)(void 0),r=Object(j.a)(n,2),c=r[0],a=r[1];return Object(d.useEffect)((function(){if(t.current){var e=t.current.getBBox(),n=e.x,r=e.y,c=e.width,s=e.height;a([n,r,c,s].map((function(e){return e.toFixed(2)})).join(" "))}}),[e]),[t,c]},le=(n(80),.85);le*=1.05;var ue=function(e){var t=e.cells,n=e.selectedPc,r=e.selectedCell,c=e.setSelectedCell,a=e.coordinates,s=oe(t),i=Object(j.a)(s,2),o=i[0],l=i[1];if(n){var u,d=Object(re.a)(t);try{for(d.s();!(u=d.n()).done;){var h=u.value,b=h.pcs.find((function(e){return e.name===ye(n)}));h.score=(null===b||void 0===b?void 0:b.score)||0}}catch(P){d.e(P)}finally{d.f()}var p,f=Math.max.apply(Math,Object(L.a)(t.map((function(e){return Math.abs(e.score)}))))||1,m=Object(re.a)(t);try{for(m.s();!(p=m.n()).done;){var O=p.value;O.strength=O.score/f||0}}catch(P){m.e(P)}finally{m.f()}}else{var g,v=t.map((function(e){return e.count})),y=Math.min.apply(Math,Object(L.a)(v)),w=Math.max.apply(Math,Object(L.a)(v)),k=Object(re.a)(t);try{for(k.s();!(g=k.n()).done;){var S=g.value;S.strength=(S.count-y)/(w-y)||0,S.strength=ie(S.strength,1)}}catch(P){k.e(P)}finally{k.f()}}return Object(x.jsx)("p",{children:Object(x.jsxs)("svg",{ref:o,viewBox:l,className:"map",children:[t.concat(r||[]).map((function(e,t){return Object(x.jsx)("rect",{className:"cell",x:e.x,y:e.y,width:le,height:le,"data-selected":e===r,fill:n?me.mix(e.strength>0?xe:Oe,Math.abs(e.strength)):fe.mix(pe,e.strength),strokeWidth:.223125,onClick:function(){return c(e===r?null:e)}},t)})),"number"===typeof a.x&&"number"===typeof a.y&&Object(x.jsx)("circle",{className:"marker",strokeWidth:.223125,cx:a.x,cy:a.y,r:.44625})]})})},je=(n(81),function(e){var t=e.selectedPc,n=e.coordinates;return Object(x.jsxs)("p",{className:"legend",children:[t&&Object(x.jsxs)(x.Fragment,{children:[Object(x.jsxs)("span",{children:[Object(x.jsx)("span",{className:"legend_square",style:{backgroundColor:xe}}),"pos pc",ye(t)]}),Object(x.jsxs)("span",{children:[Object(x.jsx)("span",{className:"legend_square",style:{backgroundColor:Oe}}),"neg pc",ye(t)]})]}),!t&&Object(x.jsxs)(x.Fragment,{children:[Object(x.jsxs)("span",{children:[Object(x.jsx)("span",{className:"legend_square",style:{backgroundColor:pe}}),"many papers"]}),Object(x.jsxs)("span",{children:[Object(x.jsx)("span",{className:"legend_square",style:{backgroundColor:fe}}),"few papers"]})]}),n.x&&n.y&&Object(x.jsx)(x.Fragment,{children:Object(x.jsxs)("span",{children:[Object(x.jsx)("span",{className:"legend_circle",style:{backgroundColor:"var(--red)"}}),"your preprint"]})})]})}),de=(n(82),function(e){var t,n=e.selectedCell,r=n.lemmas||[],c=oe(r),a=Object(j.a)(c,2),s=a[0],i=a[1],o=r.map((function(e){return e.score})),l=Math.min.apply(Math,Object(L.a)(o)),u=Math.max.apply(Math,Object(L.a)(o)),h=Object(re.a)(r);try{for(h.s();!(t=h.n()).done;){var b=t.value;b.strength=(b.score-l)/(u-l)||0}}catch(g){h.e(g)}finally{h.f()}var p=15,f=(i||"").split(" ")[2]||0,m=r.length*p+p,O=r.length*p+p;return Object(x.jsxs)(x.Fragment,{children:[Object(x.jsx)("h4",{children:"Papers"}),Object(x.jsx)("p",{children:n.count.toLocaleString()}),Object(x.jsx)("h4",{children:"Top Journals"}),Object(x.jsx)("p",{children:n.journals.map((function(e,t){var n=e.name,r=e.count;return Object(x.jsxs)("span",{className:"cell_detail_row",children:[Object(x.jsx)("span",{className:"truncate",children:n}),Object(x.jsxs)("span",{className:"truncate",children:[r.toLocaleString()," papers"]})]},t)}))}),Object(x.jsx)("h4",{children:"Top Lemmas"}),Object(x.jsx)("p",{children:Object(x.jsxs)("svg",{ref:s,viewBox:i,className:"chart",style:{width:f+"px"},children:[r.map((function(e,t){var n=Math.max(e.strength*(m-0),7.5),r=0+(t+1)*p;return Object(x.jsxs)(d.Fragment,{children:[Object(x.jsx)(T.a,{content:e.name,children:Object(x.jsx)("text",{x:-11.25,y:r,textAnchor:"end",dominantBaseline:"middle",fontSize:p,children:e.name.length>20?e.name.substr(0,20)+"...":e.name})}),Object(x.jsx)("rect",{x:0,y:r-3.75,width:n,height:7.5})]},t)})),Object(x.jsx)("path",{d:"M ".concat(0," ").concat(0," L ").concat(0," ").concat(O," L ").concat(m," ").concat(O),strokeWidth:1.5}),Object(x.jsx)("text",{x:(0+m)/2,y:O+11.25,textAnchor:"middle",dominantBaseline:"hanging",fontSize:p,children:"Association Strength"})]})})]})}),he=1,be=50,pe=H()("#606060"),fe=H()("#e0e0e0"),xe=H()("#ff9800"),me=H()("#ffffff"),Oe=H()("#2196f3"),ge=function(e){var t=e.coordinates,n=Object(d.useState)([]),r=Object(j.a)(n,2),c=r[0],a=r[1],s=Object(d.useState)(null),i=Object(j.a)(s,2),o=i[0],l=i[1],u=Object(d.useState)(null),h=Object(j.a)(u,2),b=h[0],p=h[1];return Object(d.useEffect)((function(){(function(){var e=Object(v.a)(g.a.mark((function e(){return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=a,e.next=3,fetch("./data/plot.json");case 3:return e.next=5,e.sent.json();case 5:return e.t1=e.sent,e.abrupt("return",(0,e.t0)(e.t1));case 7:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}})()()}),[]),Object(x.jsxs)(x.Fragment,{children:[Object(x.jsxs)("section",{id:"map",children:[Object(x.jsx)(T.a,{content:"A visualization of the PubMed landscape based on on textual content and model data",children:Object(x.jsxs)("h3",{children:[Object(x.jsx)(w.a,{icon:k.e}),Object(x.jsx)("span",{children:"Map of PubMed Central"})]})}),Object(x.jsx)(te,{selectedPc:o,setSelectedPc:l}),Object(x.jsx)(ue,{cells:c,selectedPc:o,selectedCell:b,setSelectedCell:p,coordinates:t}),Object(x.jsx)(je,{selectedPc:o,coordinates:t})]}),b&&Object(x.jsxs)(x.Fragment,{children:[Object(x.jsx)("hr",{}),Object(x.jsxs)("section",{id:"cell-details",children:[Object(x.jsxs)("h3",{children:[Object(x.jsx)(w.a,{icon:k.j}),Object(x.jsx)("span",{children:"Selected Square"})]}),Object(x.jsx)(de,{selectedCell:b,selectedPc:o,setSelectedPc:l})]})]})]})},ve=function(e,t){return Array.from({length:t-e+1},(function(t,n){return e+n}))},ye=function(e){return String(e).padStart(2,"0")},we=function(e){return"https://raw.githubusercontent.com/greenelab/annorxiver/master/biorxiv/pca_association_experiment/output/word_pca_similarity/figure_pieces/pca_XX_cossim_word_cloud.png".replace("XX",ye(e))},ke=function(){return Object(x.jsxs)("section",{id:"help",children:[Object(x.jsx)(T.a,{content:"Overview of this tool in more detail",children:Object(x.jsxs)("h3",{children:[Object(x.jsx)(w.a,{icon:k.f}),Object(x.jsx)("span",{children:"About this tool"})]})}),Object(x.jsxs)("p",{children:["This tool uses a machine learning model trained on 1.7 million"," ",Object(x.jsx)("a",{href:"https://www.ncbi.nlm.nih.gov/pmc/tools/openftlist/",children:"PubMed Central open access documents"})," ","to find similar papers and journals based on the textual content of your"," ",Object(x.jsx)("a",{href:"https://www.biorxiv.org/",children:"bioRxiv"})," or"," ",Object(x.jsx)("a",{href:"https://www.medrxiv.org/",children:"medRxiv"})," preprint. These results can be used as a starting point when searching for a place to publish your paper."]}),Object(x.jsx)("p",{children:'The tool also provides a "map" of the PubMed Central documents, grouped into bins based on similar textual content, and shows you where your preprint falls on the map. Select a square to learn more about the papers in that bin.'}),Object(x.jsxs)("p",{children:["The map also incorporates a set of 50"," ",Object(x.jsx)("a",{href:"https://en.wikipedia.org/wiki/Principal_component_analysis",children:"principal components"})," ","(PCs) generated from bio/medRxiv. Each PC represents two high level concepts characterized by keywords of various strengths, illustrated in the word cloud thumbnails above the map. Select a thumbnail to color the map by that PC. Deeper orange squares will be papers that correlate more with the orange keywords in the image, and vice versa for blue."]}),Object(x.jsxs)("p",{children:["For more information, see the"," ",Object(x.jsx)("a",{href:"https://github.com/greenelab/preprint-similarity-search",children:"links in the readme"}),"."]})]})},Le=n(36),Se=function(){return Object(x.jsx)("footer",{children:Object(x.jsx)("section",{children:Object(x.jsxs)("p",{children:[Object(x.jsxs)("a",{href:"https://creativecommons.org/licenses/by/4.0/",children:[Object(x.jsx)(w.a,{icon:Le.a}),Object(x.jsx)("span",{children:"CC BY 4.0"})]}),Object(x.jsx)("br",{}),"A project of the ",Object(x.jsx)("a",{href:"https://greenelab.com/",children:"Greene Lab"}),Object(x.jsx)("br",{}),Object(x.jsxs)("a",{href:"https://github.com/greenelab/preprint-similarity-search",children:[Object(x.jsx)(w.a,{icon:Le.b}),Object(x.jsx)("span",{children:"View on GitHub"})]})]})})})},Pe=(n(83),function(){var e=Object(d.useState)(J),t=Object(j.a)(e,2),n=t[0],r=t[1],c=Object(d.useState)({}),a=Object(j.a)(c,2),s=a[0],i=a[1],o=Object(d.useState)([]),l=Object(j.a)(o,2),u=l[0],h=l[1],b=Object(d.useState)([]),p=Object(j.a)(b,2),f=p[0],O=p[1],g=Object(d.useState)({}),v=Object(j.a)(g,2),y=v[0],w=v[1];return Object(x.jsxs)(x.Fragment,{children:[Object(x.jsx)(m,{}),Object(x.jsxs)("main",{children:[Object(x.jsx)(G,{status:n,setStatus:r,setPreprint:i,setSimilarJournals:h,setSimilarPapers:O,setCoordinates:w}),Object(x.jsx)(B,{status:n}),n===z&&Object(x.jsxs)(x.Fragment,{children:[Object(x.jsx)(Y,{preprint:s}),Object(x.jsx)("hr",{}),Object(x.jsx)(ee,{similarPapers:f}),Object(x.jsx)("hr",{}),Object(x.jsx)(K,{similarJournals:u})]}),Object(x.jsx)("hr",{}),Object(x.jsx)(ge,{coordinates:y}),Object(x.jsx)("hr",{}),Object(x.jsx)(ke,{})]}),Object(x.jsx)(Se,{})]})});u.a({dsn:"https://b1183a2fe86f4a8f951e9bb67341c07f@o7983.ingest.sentry.io/5407669",environment:"production"}),Object(l.render)(Object(x.jsx)(Pe,{}),document.getElementById("root"))}},[[84,1,2]]]);
//# sourceMappingURL=main.234f8c2b.chunk.js.map