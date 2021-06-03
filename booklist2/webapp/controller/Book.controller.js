sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
], function (Controller, JSONModel, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType) {

	"use strict";

	return Controller.extend("org.ubb.books.view.App", {

		//console : console.log(this.getView()),

		handleDelete: function(oEvent){
			var sBookPath= oEvent.getParameter('listItem').getBindingContext().getPath();
			console.log(this.getView())
			this.getView().getModel().remove(sBookPath,{
				success: function(){
					MessageToast.show("Book deleted");
				}
			})
		},

		onInit : function () {
			var oView = this.getView();
			var oModel = this.getModel().oData;
			var JModel = new JSONModel(oModel);
			console.log(JModel);
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
		formatDate:function(date){
			if(date != null){
            return date.slice(6,8)+'.'+date.slice(4,6)+'.'+date.slice( 0, 4 );}
        },

		getModel: function (sText) {
			return this.getOwnerComponent().getModel(sText);
			
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