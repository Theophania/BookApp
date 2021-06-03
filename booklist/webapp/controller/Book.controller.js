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
		/**
		 * Create a new entry.
		 */
		 onCreate : function () {
			
			 if(this.getView().byId("inTotalnrbooks").getValue() >= this.getView().byId("inNravailablebooks").getValue()){
			 var oData;
			 var oView=this.getView();
			 var oModel = oView.getModel();

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
        	 var sRecipient = this.getView().getModel().getProperty("/recipient/name");
         	var sMsg = oBundle.getText("Book created", [sRecipient]);
		 	var mMsg = oBundle.getText("Book not created", [sRecipient]);
			 
		
			 oData={
				Isbn :	this.getView().byId("inIsbn").getValue(),
				Autor : this.getView().byId("inAutor").getValue(),
				Title : this.getView().byId("inTitle").getValue(),
				DatePublished : this.getView().byId("inDatePublished").getDateValue(),
				Language:this.getView().byId("inLanguage").getValue(),
				TotalNrBooks: parseInt(this.getView().byId("inTotalnrbooks").getValue()),
				NrAvailableBooks:parseInt(this.getView().byId("inNravailablebooks").getValue())
			 };
			 oView.setBusy(true);
			 oModel.create("/BOOKS_TNSet", oData, {
				 success: function(oResponseData){
					MessageToast.show(sMsg);
					 oView.setBusy(false);
				 }.bind(this),
				 error: function(){
					MessageToast.show(mMsg);
					 oView.setBusy(false);
				 }
			 });
			}
			else
			MessageToast.show("Total Number of books must be bigger");
		},

		onInputNrChange: function(oEvent){
			var value = oEvent.getSource().getValue();
			var bindingContext = oEvent.getSource().getBindingContext().getPath();
			this.getView().getModel().setProperty(bindingContext+"/NrAvailableBooks",parseInt(value));
		},
		// handleChange: function (oEvent) {
        //     var oText = this.byId("textResult"),
        //         oDP = oEvent.getSource(),
        //         sValue = oEvent.getParameter("value"),
        //         bValid = oEvent.getParameter("valid");

        //     this._iEvent++;
        //     oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);

        //     if (bValid) {
        //         oDP.setValueState(ValueState.None);
        //     } else {
        //         oDP.setValueState(ValueState.Error);
        //     }
        // },
		onInit : function () {
			var oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel(),
				oMessageModelBinding = oMessageModel.bindList("/", undefined, [],
					new Filter("technical", FilterOperator.EQ, true)),
				oViewModel = new JSONModel({
					busy : false,
					hasUIChanges : false,
					order : 0
				});
			this.getView().setModel(oViewModel, "appView");
			//this.getView().setModel(oMessageModel, "message");

			//oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
			this._bTechnicalErrors = false;

			var i18nModel = new ResourceModel({
				bundleName: "org.ubb.books.i18n.i18n"
			 });
			 this.getView().setModel(i18nModel, "i18n");
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

		/**
		 * Save changes to the source.
		 */
		onSave : function () {
			var oView= this.getView();
			var oModel=oView.getModel();
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
         var sRecipient = this.getView().getModel().getProperty("/recipient/name");
         var sMsg = oBundle.getText("updateMessage", [sRecipient]);
		 var mMsg = oBundle.getText("updateMessage", [sRecipient]);
         // show message
        // MessageToast.show(sMsg);
			oModel.submitChanges({
				success: function(){
					MessageToast.show(sMsg);
					//oView._setBusy(false);
					
				},
				error: function(){
					MessageToast.show(mMsg);
					oView.setBusy(false);
				}
			});
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
		// _getText : function (sTextId, aArgs) {
		// 	return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		// },

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