import { 
		Component, 
		Prop, 
		Element, 
		Listen, 
		State,
		} from '@stencil/core';

import * as nglLib from 'ngl';

@Component({
	tag:'advanced-sheet-handler',
	styleUrl: 'advanced-sheet-handler.css'
})

export class AdvancedSheetHandler{
	@State() self = this;
	@Prop() pdbFile: string;
	@State() catalog = {};
	@Prop() max_window = 3;
	@Element() host: HTMLElement;
	@State() visible_start = 0;
	@Prop() nglview: boolean;
	@Prop() multi_view: boolean;
	@Prop() no_pdb_mention: boolean;
	@State() deleteOrClickNav: boolean = false;  // boolean to know if a sheet has been added
	@Prop() max_char = 40;
	@State() tableHeight = 200;
	@State() tableWidth = 200;
	@Listen('dataDisplayed')
	updateHandler(data){
		console.log("dataDisplayed")
		if(!this.multi_view)
			return;
		let self = this;
		let actives = this.host.getElementsByClassName('active');
		let to_update = this.host.getElementsByClassName('allDetHeader')[0];
	
		if(!this.catalog.hasOwnProperty(data.detail.id)){									// if an element is not already in the catalog
			for (let i=0; i< actives.length; i++){
				actives[i].classList.remove('active')										// we remove the previous active class of another element
			}
			let li = document.createElement('li');
			let update = document.createElement('a');

			/********************************************************************
			 * Here the code to generate the cross allowing to remove detergent *
			 ********************************************************************/

			let removeElem = document.createElement('span');
			let cross = document.createElement('i');
			cross.className ="fa fa-times fa-lg fa-pull-right";
			removeElem.appendChild(cross);
			removeElem.addEventListener('click',function(event){
				console.warn("Delete");
				event.stopPropagation()
				self.deleteOrClickNav = true;
				let navItems = self.host.getElementsByClassName('nav-item');
				let active = self.host.getElementsByClassName('active')[0];
				let to_delete = event.target["parentNode"]["parentNode"]["parentNode"];
				let right_arrow = self.host.getElementsByClassName("li-right-arrow")[0];
				let left_arrow = self.host.getElementsByClassName("li-left-arrow")[0];
				let nextDet = to_delete.nextSibling;

				if(to_delete===active){
					if(nextDet === right_arrow){
						if(to_delete.previousSibling !==self.host.getElementsByClassName("li-left-arrow")[0]){
							to_delete.previousSibling.children[0].click()		// a click call render function ()
						}
						else{
							self.host.remove()
						}
					}
					else{
						//console.log(to_delete.nextSibling.children[0])
						to_delete.nextSibling.children[0].click()
					}
				}
				if(navItems[self.visible_start].parentNode.previousSibling!==left_arrow){
					self.visible_start = self.visible_start - 1;
					//console.log(self.visible_start)
					navItems[self.visible_start]["style"].display="block";
				}
				console.log(to_delete);
 				to_delete.remove()															// we remove the li corresponding to the element we want to remove
				delete self.catalog[event.target["parentNode"]["parentNode"].text]			// we also delete it in the catalog.
				self.showItems()
				self.arrowsHandler()
				if( Object.keys(self.catalog).length === 0 )
					console.log("Empty");
			})

			/********************************************************************/
			
			update["data-toggle"]="tab";
			li.className = "active ";
			update.text = data.detail.id;
			update.addEventListener('click',function(event){
				let blocker = self.host.getElementsByClassName('blocker')[0];
				blocker["style"].display = "none";

				for (let i=0; i< actives.length; i++){
					actives[i].classList.remove('active')
				}
				let sheet = document.getElementsByTagName('advanced-sheet')[0]
				sheet.data = {'data':[self.catalog[update.text]]}
				sheet.pdbFile = self.catalog[update.text]["pdbFile"];
				event.target["parentNode"]["classList"].add('active')
				self.deleteOrClickNav = true;
			})

			update.appendChild(removeElem);
			update.classList.add("nav-item")
			update.id = data.detail.id+"-link";
			li.appendChild(update)
			to_update.appendChild(li)


			/*******************************************************************************
			* Here the code to generate the arrows allowing to navigate inside the handler *
			********************************************************************************/

			/**************
			* Left arrows *
			***************/
			let LeftArrowParentNode = this.host.getElementsByClassName("allDetHeader"); 
			let leftArrows = this.host.getElementsByClassName('li-left-arrow');
			for (let i=0; i< leftArrows.length; i++){									// Here we destroy all the left-arrows
				leftArrows[i].remove()
			}

			let liLeftArrow = document.createElement('li');
			liLeftArrow.classList.add('li-left-arrow');
			let linkLeftArrow = document.createElement('a');
			let leftArrow = document.createElement('i');
			leftArrow.className = "paginate nav-link fa fa-angle-double-left allDetheader-left-arrow";			
			linkLeftArrow.appendChild(leftArrow)
			liLeftArrow.appendChild(linkLeftArrow)
			let firstElem = LeftArrowParentNode[0].firstChild;
			LeftArrowParentNode[0].insertBefore(liLeftArrow,firstElem)

			linkLeftArrow.addEventListener("click",function(){
				self.visible_start = self.visible_start-1;
				let active = self.host.getElementsByClassName('active')[0];
				let shown = self.itemsShown()
				if(active.firstChild === shown[shown.length -1]){
					shown[shown.length-2].click()
					self.showItems()	
				}
				liRightArrow["style"].display="inline";
				self.showItems()
				self.arrowsHandler()

			})

			/***************/

			/**************
			* Right arrows *
			***************/

			let rightArrows = this.host.getElementsByClassName('li-right-arrow');
			for (let i=0; i< rightArrows.length; i++){									// Here we destroy all the right-arrows
				rightArrows[i].remove()
			}
			let liRightArrow = document.createElement('li');							// Creation of a right arrow
			liRightArrow.classList.add('li-right-arrow');
			let linkRightArrow = document.createElement('a');
			let rightArrow = document.createElement('i');
			rightArrow.className = "paginate nav-link fa fa-angle-double-right allDetheader-right-arrow";
			linkRightArrow.appendChild(rightArrow)
			liRightArrow.appendChild(linkRightArrow)
			to_update.appendChild(liRightArrow)

			linkRightArrow.addEventListener("click",function(){
				self.visible_start = self.visible_start+1;
				let active = self.host.getElementsByClassName('active')[0];
				let shown = self.itemsShown()
				if(active.firstChild === shown[0]){
					shown[1].click()
					self.showItems()
				}
				self.showItems()
				self.arrowsHandler()
			})


			/**************/


			this.catalog[data.detail.id]= data.detail.data;
			this.catalog[data.detail.id]["pdbFile"]=data.detail.pdbFile			
			this.catalog = {...this.catalog};
			self.deleteOrClickNav = false;
			this.showItems()
			this.arrowsHandler()
		}

		else{
			let navItem = document.getElementById(data.detail.id+"-link")
			navItem.click()

			let itemShown = this.itemsShown()
			let navItemShown = false;
			for(let i=0;i<itemShown.length;i++){

				if(navItem===itemShown[i]){
					navItemShown = true;
				}
			}
			if(!navItemShown){
				let navItems = this.host.getElementsByClassName('nav-item')
				let index;
				for(let i=0; i<navItems.length; i++){
					if(navItems[i].textContent === data.detail.id){
						index = i;
					}
				}
				this.visible_start = index;
				this.showItems()
				this.arrowsHandler()
			}
		}

	}

	// Function that build the nglview 
	@Listen('buildView')
	createView(data){
		let self = this;
		this.tableHeight = data.detail.tableHeight;
		this.tableWidth = data.detail.tableWidth;

		const trViewer = self.host.querySelector("tr");
		const v = self.host.querySelector(".viewer") as HTMLElement;
		//const bClose = self.host.querySelector("div.closer");
		const elem = this.host.getElementsByClassName("nglView")[0];
		const blocker = self.host.getElementsByClassName('blocker')[0];
		const canvas = elem.getElementsByTagName("canvas");
		// Default
		trViewer.style.display = "table-row";
		v.style.display = "block";
		//bClose["style"] = `margin-top: 0px;position:relative`;
		blocker["style"].display = "none";

  		if(this.nglview){																								// if we chose to represent the view
  			
			if(canvas.length === 0)																					// if we don't have a view yet
  				window["stage"] = new nglLib.Stage( elem, { backgroundColor: "white"} );						// we create it	

			const nglViewH = 100*(data.detail.tableHeight) / 100;
			const nglViewW = 90*(data.detail.tableWidth) / 100;
			console.log(nglViewH, nglViewW, "<-- NGL DIM" );
  			elem["style"]=`height:${nglViewH}px;width:${nglViewW}px;`
  			//elem["style"]="width:" + this.innerWidth +"px;"
			window["stage"].removeAllComponents();

			
				
  			window["stage"].loadFile(data.detail.file)
  			.then(function(component){				
  				window["stage"].handleResize();  				
  				component.addRepresentation("ball+stick");
  				component.autoView();
  			})
  			.catch(function(error){
  				console.log(error)
  				elem["style"].display="none";
				
				trViewer.style.display = "";
				v.style.display = "";
				//bClose["style"] = "";
  				if (self.no_pdb_mention ) {
					blocker["style"] =`display:inline-block;border:none;height:${nglViewH}px;width:${nglViewW}px;`
					blocker.children[0]["textContent"]="Warning ! : "+ data.detail.file + " doesn't exists"
				} else {
					trViewer.style.display = "none";
					v.style.display = "none";
					blocker["style"] =`display:none`;
					
					//const offset = self.tableWidth - bClose.clientWidth;
					//bClose["style"] = `margin-top: -5px;position:absolute;left:${offset - 2}px`;

				}
			
			});
		}

  	}

	// @Listen('shortenReady')
	// shortenTooltipable(data){
		
	// 	let tooltipable = this.host.getElementsByClassName("tooltipable");
	// 	console.log("---------")
	// 	console.dir(tooltipable)
	// 	console.log(this.catalog)
 //    	for (let i=0; i<tooltipable.length; i++){
 //    		//let id = actives[0]
 //    		//console.log(id.textContent) 
 //    		//console.log(tooltipable[i])
 //    		//console.log(this.catalog[data.detail][tooltipable[i].previousSibling.textContent])
 //    		//console.log(tooltipable[i])
 //    		tooltipable[i].innerHTML = this.catalog[data.detail][tooltipable[i].previousSibling.textContent].substr(0,this.max_char) + "...";
 //    		//console.log(this.catalog[data.detail][tooltipable[i].previousSibling.textContent])
 //    	}
    	
 //    	//console.log(this.catalog[data.detail])
 //    	//data.detail
	// }
	





	showItems = function () {
		if(Object.keys(this.catalog).length>this.max_window && this.deleteOrClickNav === false){
			this.visible_start = this.visible_start + 1;
		}
		else if(Object.keys(this.catalog).length<=this.max_window){
			this.visible_start = 0;
		}
		let navItems = this.host.getElementsByClassName('nav-item');

		for(let i=0; i<navItems.length; i++){
			if(i<this.visible_start ){	
				navItems[i]["style"].display="none";
			}
			else if(i>this.visible_start + this.max_window - 1){
				navItems[i]["style"].display="none";
			}
			else{
				navItems[i]["style"].display="block";
			}
		}
	}


	itemsShown = function () {
		let navItems = this.host.getElementsByClassName('nav-item');
		let shown = [];																		// a variable giving the items that are shown
		for(let i = 0; i<navItems.length; i++){
			if(navItems[i]["style"].display==="block"){
				shown.push(navItems[i])
			}
		}
		return shown;
	}

	arrowsHandler = function () {
		let navItems =this.host.getElementsByClassName('nav-item');
		let liRightArrow = this.host.getElementsByClassName('li-right-arrow')[0];
		let liLeftArrow = this.host.getElementsByClassName('li-left-arrow')[0];


		if(Object.keys(this.catalog).length>this.max_window && this.visible_start>0){
			liLeftArrow["style"].display = "inline";
		}
		else{
			liLeftArrow["style"].display = "none";
		}
		if(this.visible_start === 0){
			liLeftArrow["style"].display = "none";
		}

		let shown = this.itemsShown()
		if(shown[shown.length - 1] === navItems[navItems.length - 1]){
			liRightArrow["style"].display = "none";
		}
		if(Object.keys(this.catalog).length>this.max_window && this.visible_start>=0 && shown[shown.length-1] !== navItems[navItems.length - 1]){
			liRightArrow["style"].display = "inline";
		}
	}

	componentDidUnload() {
		console.warn('Advanced sheet handler has been removed from the DOM');
	}

	componentDidLoad() {
		let self = this;
	//	console.warn('Advanced sheet handle did load');
		const closeBut = this.host.querySelector("div.closer");
	//	console.dir(closeBut);
		closeBut.addEventListener('click', () => {
			self.host.remove();
		});
	}
	/*componentDidUpdate() {
		console.warn('Advanced sheet handle has been updated');
		const closeBut = this.host.querySelector("div.closer");
		console.dir(closeBut);
	}*/
	/*componentDidRender() {
	console.warn('Advanced sheet handle has been rendered');
	const closeBut = this.host.querySelector("div.closer");
	console.dir(closeBut);

	}*/

	render(){
		const headerMarkup = this.multi_view ? '<ul class="nav nav-tabs allDetHeader" ></ul>' : '';
		const self = this;
		return(
			<div class="wrapper">
			<table>
			<div class="sheetHandler">
				{headerMarkup}
				<div style={{display:"inline"}}>
		    		<div class="tab-content allDetBody " id="DetContent">
		    			<advanced-sheet max_char = {this.max_char} ></advanced-sheet>
		    			<tr>
		    				<div class="viewer" 
							style={{"min-width":`${self.tableWidth}px`, "max-width":`${self.tableWidth}px`}}
							>
		   						<div class="nglView " ><div class="downloadPdb"></div><div class="detView"></div></div>
   								<div class="blocker "><i class="fa fa-exclamation-triangle"></i></div>
   							</div>
   						</tr>
					</div>
					<div class="closer pull-right" >Close</div>				
				</div>
    		</div>
    		<div class = "shortentooltip"><p class="shortentooltiptext"></p></div>
    		</table>
			</div>
		);
	}
}