sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/resource/ResourceModel"
], function (Controller, JSONModel, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType, ResourceModel) {

	"use strict";

	return Controller.extend("org.ubb.books.view.App", {
		handleDelete: function(oEvent){
			var oView=this.getView();
			 var oModel = oView.getModel();

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
        	 var sRecipient = this.getView().getModel().getProperty("/recipient/name");
         	var sMsg = oBundle.getText("delete", [sRecipient]);
		 	var mMsg = oBundle.getText("notdeleted", [sRecipient]);
			var sBookPath= oEvent.getParameter('listItem').getBindingContext().getPath();
			this.getView().getModel().remove(sBookPath,{
				success: function(){
					MessageToast.show(sMsg);
				},
				error: function(){
					MessageToast.show(mMsg);
					 //oView.setBusy(false);
				 }
			})
		},
		checkoutBook: function () {
			
				var items = this.getView().byId("idBooksTable").getSelectedItems();
				var oData;
				var oView=this.getView();
				var oModel = oView.getModel();
				for (var i = 0; i < items.length; i++) {
	
					var item = items[i];
					var context = item.getBindingContext();
					var obj = context.getProperty(null, context);
					// alert(obj.Isbn);
					if (obj.NrAvailableBooks == 0)
                    MessageToast.show('0 books available! operation not possible');
                else{
					oData= {
							Isbn: obj.Isbn,
							Autor: obj.Autor,
							Title: obj.Title,
							DatePublished: obj.DatePublished,
							Language: obj.Language,
							TotalNrBooks: obj.TotalNrBooks,
							NrAvailableBooks: obj.NrAvailableBooks
						};
						
						oModel.create("/SEARCH_BOOK_TENESet", oData, {
							success: function(oResponseData){
							   MessageToast.show('Book checked out');
								//oView.setBusy(false);
							}.bind(this),
							error: function(){
							   MessageToast.show('Error');
								//oView.setBusy(false);
							}
						});
					} }
			  },
			
		 

		onInputNrChange: function(oEvent){
			var value = oEvent.getSource().getValue();
			var bindingContext = oEvent.getSource().getBindingContext().getPath();
			this.getView().getModel().setProperty(bindingContext+"/NrAvailableBooks",parseInt(value));
		},
		
		onInit : function () {
			
			var oJSONData = {
				busy : false,
				order : 0
			};
			var oModel = new JSONModel(oJSONData);
			this.getView().setModel(oModel, "appView");	

			// var i18nModel = new ResourceModel({
			// 	bundleName: "org.ubb.books.i18n.i18n"
			//  });
			//  this.getView().setModel(i18nModel, "i18n");
		},

		
		/**
		 * Lock UI when changing data in the input controls
		 * @param {sap.ui.base.Event} oEvt - Event data
		 */
		 onInputChange : function (oEvt) {
			if (oEvt.getParameter("escPressed")) {
				this._setUIChanges();
			} else {
				this._setUIChanges(true);
			}
		},

		/**
		 * Refresh the data.
		 */
		onRefresh : function () {
			var oBinding = this.byId("idBooksTable").getBinding("items");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error(this._getText("refreshNotPossibleMessage"));
				return;
			}
			oBinding.refresh();
			MessageToast.show(this._getText("refreshSuccessMessage"));
		},

		/**
		 * Reset any unsaved changes.
		 */
		onResetChanges : function () {
			this.byId("idBooksTable").getBinding("items").resetChanges();
			this._bTechnicalErrors = false; // If there were technical errors, cancelling changes resets them.
			this._setUIChanges(false);
		},

		onSearch : function () {
			var oFilters = [];
	
			var oView = this.getView(),
				titleValue = oView.byId("searchTitle").getValue(),
				autorValue = oView.byId("searchAutor").getValue(),
				isbnValue = oView.byId("searchId").getValue(),
				dateValue = oView.byId("searchDate").getValue(),
				// dateValue = new Date(oView.byId("searchDate").getDateValue()),
				languageValue = oView.byId("searchLanguage").getValue(),
				//console.log(languageValue),
	
				oFilterTitle = new Filter("Title", FilterOperator.Contains, titleValue),
				oFilterAutor = new Filter("Autor", FilterOperator.Contains, autorValue),
				oFilterIsbn = new Filter("Isbn", FilterOperator.Contains, isbnValue),
				oFilterDate = new Filter("DatePublished", FilterOperator.EQ, dateValue),
				oFilterLanguage = new Filter("Language", FilterOperator.EQ, languageValue);
				//console.log(dateValue);
				if (autorValue.length != 0){
	
					oFilters.push(oFilterAutor);
	
				}
	
				if (titleValue.length != 0){
	
					oFilters.push(oFilterTitle);
				}
	
				if (isbnValue.length != 0){
	
					oFilters.push(oFilterIsbn);
				}
	
				if (languageValue.length != 0){
	
					oFilters.push(oFilterLanguage);
				}
				if (dateValue != null && dateValue!=""){
	
					oFilters.push(oFilterDate);
				}
	
			oView.byId("idBooksTable").getBinding("items").filter(oFilters);
	
	
		},
		


		onMessageBindingChange : function (oEvent) {
			var aContexts = oEvent.getSource().getContexts(),
				aMessages,
				bMessageOpen = false;

			if (bMessageOpen || !aContexts.length) {
				return;
			}

			// Extract and remove the technical messages
			aMessages = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			sap.ui.getCore().getMessageManager().removeMessages(aMessages);

			this._setUIChanges(true);
			this._bTechnicalErrors = true;
			MessageBox.error(aMessages[0].message, {
				id : "serviceErrorMessageBox",
				onClose : function () {
					bMessageOpen = false;
				}
			});

			bMessageOpen = true;
		},


		/* =========================================================== */
		/*           end: event handlers                               */
		/* =========================================================== */


		/**
		 * Convenience method for retrieving a translatable text.
		 * @param {string} sTextId - the ID of the text to be retrieved.
		 * @param {Array} [aArgs] - optional array of texts for placeholders.
		 * @returns {string} the text belonging to the given ID.
		 */
		_getText : function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		},

		/**
		 * Set hasUIChanges flag in View Model
		 * @param {boolean} [bHasUIChanges] - set or clear hasUIChanges
		 * if bHasUIChanges is not set, the hasPendingChanges-function of the OdataV4 model determines the result
		 */
		_setUIChanges : function (bHasUIChanges) {
			if (bHasUIChanges === undefined) {
				bHasUIChanges = this.getView().getModel().hasPendingChanges();
			}
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/hasUIChanges", bHasUIChanges);
		},

		/**
		 * Set busy flag in View Model
		 * @param {boolean} bIsBusy - set or clear busy
		 */
		_setBusy : function (bIsBusy) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/busy", bIsBusy);
		}

	});
});