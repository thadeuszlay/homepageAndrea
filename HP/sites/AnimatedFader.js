/*******************************************************************
*
* File    : AnimatedFader.js
*
* Created : 2000/05/28
*
* Author  : Roy Whittle  (Roy@Whittle.com) www.Roy.Whittle.com
*
* Purpose : To create fading text descriptions
*
* History
* Date         Version        Description
*
* 2000-05-28	1.0		Initial version. Based on the State Transition
*					Diagram created for animated rollovers I
*					modified the code to fade text.
* 2000-05-29	1.1		I did not follow the STD correctly and introduced
*					a bug that left objects in the ON state.
*					This is now corrected.
* 2000-06-07	1.2		Introduced a start colour so that the script
*					can be used on different backgrounds.
*					Change the var AnimationRunning and FrameInterval
*					so they don't conflict with animate2.js
* 2000-08-09	1.3		Added Gecko ( Netscape 6 Preview Release 1 ) support
*					- Ken workman k.workman@3DASA.com
* 2000-10-15	1.4		Modified to make Netscpe 6 (PR3) more efficient
*					by just changing the color instead of replacing
*					the whole content of the DIV.
***********************************************************************/
/*** Create some global variables ***/
var FadingObject = new Array();
var FadeRunning=false;
var FadeInterval=30;

/*******************************************************************************/
/*** These are the simplest HEX/DEC conversion routines I could come up with ***/
/*** I have seen a lot of fade routines that seem to make this a             ***/
/*** very complex task. I am sure somene else must've had this idea          ***/
/*******************************************************************************/
var hexDigit=new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");
function dec2hex(dec)
{
	return(hexDigit[dec>>4]+hexDigit[dec&15]);
}
function hex2dec(hex)
{
	return(parseInt(hex,16))
}
/******************************************************************************************/

/***********************************************************
* Function   : createFaderObject
*
* Parameters : theDiv   - The name of the DIV in which to fade the text
*              numSteps - The number of steps to use in the fade.
*		       startColor - The background colour of the page.
*              
* Description : Creates an object that can hold the current
*               state of the fade animation for a particular DIV
***********************************************************/
function createFaderObject(theDiv, numSteps, startColor)
{
	if(!startColor)
		startColor = "000000";
		
	this.name		= theDiv;
	this.text		= null;
	this.color		= "FFFFFF";
	this.next_text	= null;
	this.next_color	= null;
	this.state		= "OFF";
	this.index		= 0;
	this.steps		= numSteps;
	this.r		= hex2dec(startColor.slice(0,2));
	this.g		= hex2dec(startColor.slice(2,4));
	this.b		= hex2dec(startColor.slice(4,6));
}

/***********************************************************
* Function   : FadingText
*
* Parameters : theDiv   - The name of the DIV in which to fade the text
*              numSteps - The number of steps to use in the fade.
*              
* Description : Library function to be called from the main HTML.
*		        Creates an object that can hold the current
*               state of the fade animation for a particular DIV
***********************************************************/
function FadingText(theDiv, numSteps, startColor)
{
	FadingObject[theDiv] = new createFaderObject(theDiv, numSteps, startColor);
}
/*****************************************************************
* Function    : start_fading
*
* Description : If the FadeAnimation loop is not currently running
*		        then it is started.
*****************************************************************/
function start_fading()
{
	if(!FadeRunning)
		FadeAnimation();
}
/*****************************************************************
* Function    : set_text
*
* Description : In the new W3C DOM model we need only set the text
*			once, after that we can just change the colour
*****************************************************************/
function set_text(f)
{
	if(navigator.appName.indexOf("Netscape") != -1
		&& document.getElementById)
	{
		var theElement = document.getElementById(f.name);
		var newRange   = document.createRange();
		newRange.setStartBefore(theElement);
		var strFrag    = newRange.createContextualFragment(f.text);	

		while (theElement.hasChildNodes())
			theElement.removeChild(theElement.lastChild);
		theElement.appendChild(strFrag);
		theElement.style.color="#"+f.startColor;
	}
}
/*****************************************************************
*
* Function   : getColor
*
* Parameters : f - the fade object for which to calculate the colour.
*
* Description: Calculates the color of the link depending on
*		       how far through the fade we are.
*
*****************************************************************/
function getColor(f)
{
	var r=hex2dec(f.color.slice(0,2));
	var g=hex2dec(f.color.slice(2,4));
	var b=hex2dec(f.color.slice(4,6));

	r2= Math.floor(f.r+(f.index*(r-f.r))/(f.steps) + .5);
	g2= Math.floor(f.g+(f.index*(g-f.g))/(f.steps) + .5);
	b2= Math.floor(f.b+(f.index*(b-f.b))/(f.steps) + .5);

	return("#" + dec2hex(r2) + dec2hex(g2) + dec2hex(b2));
}
/*****************************************************************
*
* Function   : setColor
*
* Parameters : fadeObj   - The TextFader object to set
*
* Description: Gets the color of the text and writes it to
*		       the DIV.
*
*****************************************************************/
function setColor(fadeObj)
{
	var theColor=getColor(fadeObj);
	var str="<FONT COLOR="+ theColor + ">" + fadeObj.text + "</FONT>";
	var theDiv=fadeObj.name;
	
//if IE 4+
	if(document.all)
	{
		document.all[theDiv].innerHTML=str;
	}	
//else if NS 4
	else if(document.layers)
	{
		document.nscontainer.document.layers[theDiv].document.write(str);
		document.nscontainer.document.layers[theDiv].document.close();
	}
//else if NS 6 (supports new DOM, may work in IE5) - see Website Abstraction for more info.
//http://www.wsabstract.com/javatutors/dynamiccontent4.shtml
	else if (document.getElementById)
	{
		theElement = document.getElementById(theDiv);
		theElement.style.color=theColor;
	}
	
}
/*****************************************************************
*
* Function   : fade_up
*
* Parameters : theDiv  - The div in which to display the text
*		       newText - The text to display when faded in
*		       newColor- The color the text will be.
*
* Description: Depending on the current "state" of the fade
*		       this function will determine the new state and
*		       if neccessary, start the fade effect.            
*
*****************************************************************/
function fade_up(theDiv, newText, newColor)
{
	var f=FadingObject[theDiv];

	if(newColor == null)
		newColor="FFFFFF";

	if(f.state == "OFF")
	{
		f.text  = newText;
		f.color = newColor;
		f.state = "FADE_UP";
		set_text(f);
		start_fading();
	}
	else if( f.state == "FADE_UP_DOWN"
		|| f.state == "FADE_DOWN"
		|| f.state == "FADE_DOWN_UP")
	{
		if(newText == f.text)
			f.state = "FADE_UP";
		else
		{
			f.next_text  = newText;
			f.next_color = newColor;
			f.state      = "FADE_DOWN_UP";
		}
	}
}
/*****************************************************************
*
* Function   : fade_down
*
* Parameters : theDiv  - The div in which to display the text
*
* Description: Depending on the current "state" of the fade
*		       this function will determine the new state and
*		       if neccessary, start the fade effect.            
*
*****************************************************************/
function fade_down(theDiv)
{
	var f=FadingObject[theDiv];

	if(f.state=="ON")
	{
		f.state="FADE_DOWN";
		start_fading();
	}
	else if(f.state=="FADE_DOWN_UP")
	{
		f.state="FADE_DOWN";
		f.next_text = null;
	}
	else if(f.state == "FADE_UP")
	{
		f.state="FADE_UP_DOWN";
	}
}
/*******************************************************************
*
* Function    : Animate
*
* Description : This function is based on the Animate function
*		        of animate.js (animated rollovers).
*		        Each fade object has a state. This function
*		        modifies each object and changes its state.
*****************************************************************/
function FadeAnimation()
{
	FadeRunning = false;
	for (var d in FadingObject)
	{
		var f=FadingObject[d];

		if(f.state == "FADE_UP")
		{
			if(f.index < f.steps)
				f.index++;
			else
				f.index = f.steps;
			setColor(f);

			if(f.index == f.steps)
				f.state="ON";
			else
				FadeRunning = true;
		}
		else if(f.state == "FADE_UP_DOWN")
		{
			if(f.index < f.steps)
				f.index++;
			else
				f.index = f.steps;
			setColor(f);

			if(f.index == f.steps)
				f.state="FADE_DOWN";
			FadeRunning = true;
		}
		else if(f.state == "FADE_DOWN")
		{
			if(f.index > 0)
				f.index--;
			else
				f.index = 0;
			setColor(f);

			if(f.index == 0)
				f.state="OFF";
			else
				FadeRunning = true;
		}
		else if(f.state == "FADE_DOWN_UP")
		{
			if(f.index > 0)
				f.index--;
			else
				f.index = 0;
			setColor(f);

			if(f.index == 0)
			{
				f.text      = f.next_text;
				f.color     = f.next_color;
				f.next_text = null;
				f.state     ="FADE_UP";
				set_text(f);
			}
			FadeRunning = true;
		}
	}
	/*** Check to see if we need to animate any more frames. ***/
	if(FadeRunning)
		setTimeout("FadeAnimation()", FadeInterval);

}